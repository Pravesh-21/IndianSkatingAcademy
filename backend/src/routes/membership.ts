import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import sql, { checkAndSuspendExpiredMembers } from '../services/db.js';

const router = Router();

// ── Razorpay Client ────────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID     ?? '',
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? '',
});

// ── Pricing (in paise — INR × 100) ────────────────────────────────────────────
const PLAN_PRICES: Record<number, number> = {
  1:  59900,   // ₹599  / month
  3:  149900,  // ₹1499 / 3 months
  6:  249900,  // ₹2499 / 6 months
  12: 399900,  // ₹3999 / year
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Add months to a Date, returns a new Date */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Format a JS Date as a YYYY-MM-DD string */
function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ── Validation Schemas ─────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name:              z.string().min(2).max(80),
  email:             z.string().email(),
  phone:             z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  dob:               z.string().min(10),
  address:           z.string().min(5).max(300),
  discipline:        z.enum(['speed', 'artistic', 'slalom', 'aggressive']),
  aadhar_number:     z.string().optional(),
  guardian_name:     z.string().optional(),
  blood_group:       z.string().optional(),
  emergency_contact: z.string().optional(),
  plan_months:       z.number().int().refine((v) => [1, 3, 6, 12].includes(v), 'Invalid plan'),
});

const RenewSchema = z.object({
  phone:       z.string().regex(/^[6-9]\d{9}$/),
  plan_months: z.number().int().refine((v) => [1, 3, 6, 12].includes(v), 'Invalid plan'),
});

const VerifySchema = z.object({
  razorpay_order_id:   z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature:  z.string(),
  membership_id:       z.number().int(),
});

// ── Routes ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/membership/register
 * New admission: creates member record + Razorpay order.
 * If member with same phone/email already exists (not suspended), returns error.
 */
router.post('/register', async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.flatten().fieldErrors });
    return;
  }

  const {
    name, email, phone, dob, address, discipline,
    aadhar_number, guardian_name, blood_group, emergency_contact,
    plan_months,
  } = result.data;

  try {
    // Check if member already exists
    const existing = await sql`
      SELECT id, status FROM members WHERE phone = ${phone} OR email = ${email}
    `;

    if (existing.length > 0) {
      const member = existing[0];
      if (member.status !== 'suspended') {
        res.status(409).json({
          success: false,
          message: 'A member with this phone or email already exists. Please use the Membership portal to renew.',
          member_status: member.status,
        });
        return;
      }
      // Suspended → allow re-registration: update existing record
      await sql`
        UPDATE members
        SET name = ${name}, email = ${email}, address = ${address},
            discipline = ${discipline}, dob = ${dob},
            aadhar_number = ${aadhar_number ?? null},
            guardian_name = ${guardian_name ?? null},
            blood_group = ${blood_group ?? null},
            emergency_contact = ${emergency_contact ?? null},
            status = 'pending', updated_at = NOW()
        WHERE id = ${member.id}
      `;
    } else {
      // New member — insert
      await sql`
        INSERT INTO members (name, email, phone, dob, address, discipline,
                             aadhar_number, guardian_name, blood_group, emergency_contact)
        VALUES (${name}, ${email}, ${phone}, ${dob}, ${address}, ${discipline},
                ${aadhar_number ?? null}, ${guardian_name ?? null},
                ${blood_group ?? null}, ${emergency_contact ?? null})
      `;
    }

    // Fetch the created/updated member
    const [member] = await sql`SELECT id FROM members WHERE phone = ${phone}`;

    // Create Razorpay order
    const amount = PLAN_PRICES[plan_months];
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `reg_${member.id}_${Date.now()}`,
      notes: {
        member_id:   String(member.id),
        plan_months: String(plan_months),
        type:        'admission',
      },
    });

    // Calculate expiry date (from today for new admissions)
    const startDate  = new Date();
    const expiryDate = addMonths(startDate, plan_months);

    // Create pending membership row
    const [membership] = await sql`
      INSERT INTO memberships (member_id, plan_months, amount_paise,
                               razorpay_order_id, start_date, expiry_date, status)
      VALUES (${member.id}, ${plan_months}, ${amount},
              ${order.id}, ${toDateStr(startDate)}, ${toDateStr(expiryDate)}, 'pending')
      RETURNING id
    `;

    res.status(200).json({
      success:       true,
      order_id:      order.id,
      amount,
      currency:      'INR',
      membership_id: membership.id,
      member_id:     member.id,
    });
  } catch (error) {
    console.error('[Membership] Error in /register:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

/**
 * POST /api/membership/renew
 * Renewal for existing members (active or expired within 2-month grace).
 * Calculates new expiry from LAST expiry date (not today).
 */
router.post('/renew', async (req: Request, res: Response) => {
  const result = RenewSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.flatten().fieldErrors });
    return;
  }

  const { phone, plan_months } = result.data;

  try {
    await checkAndSuspendExpiredMembers();

    const memberRows = await sql`SELECT id, status FROM members WHERE phone = ${phone}`;
    if (memberRows.length === 0) {
      res.status(404).json({ success: false, message: 'No member found with this phone number. Please register first.' });
      return;
    }

    const member = memberRows[0];
    if (member.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your membership has been suspended (inactive for over 2 months). Please re-register via the Admission form.',
        redirect: '/admission',
      });
      return;
    }

    // Get the most recent active membership to calculate new expiry
    const latestRows = await sql`
      SELECT expiry_date FROM memberships
      WHERE member_id = ${member.id} AND status = 'active'
      ORDER BY expiry_date DESC
      LIMIT 1
    `;

    let baseDate: Date;
    if (latestRows.length > 0) {
      // Extend from last expiry date (even if in the past)
      baseDate = new Date(latestRows[0].expiry_date);
    } else {
      baseDate = new Date();
    }

    const newExpiryDate = addMonths(baseDate, plan_months);
    const startDate     = new Date(); // payment starts today

    const amount = PLAN_PRICES[plan_months];
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt:  `renew_${member.id}_${Date.now()}`,
      notes: {
        member_id:   String(member.id),
        plan_months: String(plan_months),
        type:        'renewal',
      },
    });

    const [membership] = await sql`
      INSERT INTO memberships (member_id, plan_months, amount_paise,
                               razorpay_order_id, start_date, expiry_date, status)
      VALUES (${member.id}, ${plan_months}, ${amount},
              ${order.id}, ${toDateStr(startDate)}, ${toDateStr(newExpiryDate)}, 'pending')
      RETURNING id
    `;

    res.status(200).json({
      success:        true,
      order_id:       order.id,
      amount,
      currency:       'INR',
      membership_id:  membership.id,
      member_id:      member.id,
      base_expiry:    toDateStr(baseDate),
      new_expiry:     toDateStr(newExpiryDate),
    });
  } catch (error) {
    console.error('[Membership] Error in /renew:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

/**
 * POST /api/membership/verify-payment
 * Called after Razorpay checkout succeeds.
 * Verifies HMAC signature and activates the membership.
 */
router.post('/verify-payment', async (req: Request, res: Response) => {
  const result = VerifySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, errors: result.error.flatten().fieldErrors });
    return;
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, membership_id } = result.data;

  // Verify Razorpay signature
  const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expected  = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET ?? '')
    .update(body)
    .digest('hex');

  if (expected !== razorpay_signature) {
    res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    return;
  }

  try {
    // Activate membership
    const updated = await sql`
      UPDATE memberships
      SET status = 'active',
          razorpay_payment_id = ${razorpay_payment_id},
          razorpay_signature  = ${razorpay_signature}
      WHERE id = ${membership_id}
      RETURNING member_id, expiry_date
    `;

    if (updated.length === 0) {
      res.status(404).json({ success: false, message: 'Membership record not found.' });
      return;
    }

    const { member_id, expiry_date } = updated[0];

    // Activate member record
    await sql`
      UPDATE members SET status = 'active', updated_at = NOW() WHERE id = ${member_id}
    `;

    res.status(200).json({
      success:     true,
      message:     'Payment verified! Your membership is now active.',
      expiry_date: toDateStr(new Date(expiry_date)),
    });
  } catch (error) {
    console.error('[Membership] Error in /verify-payment:', error);
    res.status(500).json({ success: false, message: 'Payment received but activation failed. Please contact support.' });
  }
});

/**
 * GET /api/membership/status/:phone
 * Returns member profile + active membership status.
 * Also triggers the suspension check.
 */
router.get('/status/:phone', async (req: Request, res: Response) => {
  const phone = req.params.phone as string;
  if (!/^[6-9]\d{9}$/.test(phone)) {
    res.status(400).json({ success: false, message: 'Invalid phone number.' });
    return;
  }

  try {
    await checkAndSuspendExpiredMembers();

    const memberRows = await sql`
      SELECT id, name, email, phone, dob, address, discipline,
             blood_group, guardian_name, emergency_contact, status, created_at
      FROM members WHERE phone = ${phone}
    `;

    if (memberRows.length === 0) {
      res.status(404).json({ success: false, message: 'No member found with this phone number.' });
      return;
    }

    const member = memberRows[0];

    // Get latest active membership
    const latestRows = await sql`
      SELECT id, plan_months, start_date, expiry_date, status, created_at
      FROM memberships
      WHERE member_id = ${member.id} AND status = 'active'
      ORDER BY expiry_date DESC
      LIMIT 1
    `;

    const membership = latestRows.length > 0 ? latestRows[0] : null;

    // Days until expiry
    let daysLeft: number | null = null;
    if (membership) {
      const expiry = new Date(membership.expiry_date);
      daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
    }

    res.status(200).json({
      success: true,
      member: {
        id:                member.id,
        name:              member.name,
        email:             member.email,
        phone:             member.phone,
        dob:               member.dob,
        address:           member.address,
        discipline:        member.discipline,
        blood_group:       member.blood_group,
        guardian_name:     member.guardian_name,
        emergency_contact: member.emergency_contact,
        status:            member.status,
        member_since:      member.created_at,
      },
      membership: membership ? {
        id:          membership.id,
        plan_months: membership.plan_months,
        start_date:  toDateStr(new Date(membership.start_date)),
        expiry_date: toDateStr(new Date(membership.expiry_date)),
        days_left:   daysLeft,
      } : null,
    });
  } catch (error) {
    console.error('[Membership] Error in /status:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

/**
 * POST /api/membership/check-suspensions
 * Admin/cron endpoint to run suspension checks manually.
 */
router.post('/check-suspensions', async (_req: Request, res: Response) => {
  try {
    await checkAndSuspendExpiredMembers();
    res.status(200).json({ success: true, message: 'Suspension check completed.' });
  } catch (error) {
    console.error('[Membership] Error in /check-suspensions:', error);
    res.status(500).json({ success: false, message: 'Suspension check failed.' });
  }
});

/**
 * GET /api/membership/plans
 * Returns available membership plans and pricing.
 */
router.get('/plans', (_req: Request, res: Response) => {
  const plans = Object.entries(PLAN_PRICES).map(([months, paise]) => ({
    months:     Number(months),
    amount_paise: paise,
    amount_inr: paise / 100,
    label:      Number(months) === 1  ? '1 Month'    :
                Number(months) === 3  ? '3 Months'   :
                Number(months) === 6  ? '6 Months'   : '1 Year',
    savings:    Number(months) === 1  ? null :
                Number(months) === 3  ? 'Save ₹298'  :
                Number(months) === 6  ? 'Save ₹1095' : 'Save ₹2989',
  }));
  res.status(200).json({ success: true, plans });
});

export default router;
