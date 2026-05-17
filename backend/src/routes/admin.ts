import { Router, Request, Response } from 'express';
import sql from '../services/db.js';

const router = Router();

// Get all event registrations
router.get('/registrations', async (_req: Request, res: Response) => {
  try {
    const data = await sql`
      SELECT * FROM event_registrations
      ORDER BY submitted_at DESC
    `;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[Admin] Error fetching registrations:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get all inquiries
router.get('/inquiries', async (_req: Request, res: Response) => {
  try {
    const data = await sql`
      SELECT * FROM inquiries
      ORDER BY submitted_at DESC
    `;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[Admin] Error fetching inquiries:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete an inquiry
router.delete('/inquiries/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await sql`
      DELETE FROM inquiries
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
       res.status(404).json({ success: false, message: 'Inquiry not found' });
       return;
    }
    res.json({ success: true, message: 'Inquiry deleted successfully' });
  } catch (error) {
    console.error('[Admin] Error deleting inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update an inquiry
router.put('/inquiries/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, message } = req.body;
  try {
    const result = await sql`
      UPDATE inquiries
      SET name = ${name}, phone = ${phone}, message = ${message}
      WHERE id = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
       res.status(404).json({ success: false, message: 'Inquiry not found' });
       return;
    }
    res.json({ success: true, message: 'Inquiry updated successfully', data: result[0] });
  } catch (error) {
    console.error('[Admin] Error updating inquiry:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

