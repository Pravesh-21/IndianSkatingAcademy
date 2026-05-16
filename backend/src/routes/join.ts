import { Router, Request, Response } from 'express';
import { z } from 'zod';
import Enquiry from '../models/Enquiry.js';
import { sendEnquiryEmail } from '../services/brevo.js';

const router = Router();

const JoinSchema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters').max(60),
  age:        z.number({ invalid_type_error: 'Age must be a number' }).int().min(4, 'Age must be at least 4').max(80, 'Age must be 80 or below'),
  phone:      z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  discipline: z.enum(['speed', 'artistic', 'slalom', 'aggressive'], {
    errorMap: () => ({ message: 'Select a valid discipline' }),
  }),
  method:     z.enum(['email', 'whatsapp'], {
    errorMap: () => ({ message: 'Method must be email or whatsapp' }),
  }),
});

router.post('/', async (req: Request, res: Response) => {
  const result = JoinSchema.safeParse(req.body);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    res.status(400).json({ success: false, errors });
    return;
  }

  const { name, age, phone, discipline, method } = result.data;

  try {
    // Save to MongoDB
    const enquiry = new Enquiry({ name, age, phone, discipline, method });
    await enquiry.save();
    console.log(`[Join] Saved enquiry from ${name} (${method})`);

    // Send email notification (only for email method, skip for whatsapp)
    if (method === 'email') {
      await sendEnquiryEmail({ name, age, phone, discipline });
    }

    res.status(200).json({ success: true, message: 'Enquiry received! We will be in touch soon.' });
  } catch (error) {
    console.error('[Join] Error processing enquiry:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

export default router;
