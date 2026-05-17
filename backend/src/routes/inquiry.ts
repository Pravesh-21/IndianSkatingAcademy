import { Router, Request, Response } from 'express';
import { z } from 'zod';
import sql from '../services/db.js';

const router = Router();

const InquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  message: z.string().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  const result = InquirySchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    res.status(400).json({ success: false, errors });
    return;
  }

  const { name, phone, message } = result.data;

  try {
    await sql`
      INSERT INTO inquiries (name, phone, message)
      VALUES (${name}, ${phone}, ${message || null})
    `;
    console.log(`[Inquiry] Saved inquiry from ${name}`);

    res.status(200).json({ success: true, message: 'Inquiry received! We will be in touch soon.' });
  } catch (error) {
    console.error('[Inquiry] Error processing inquiry:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
