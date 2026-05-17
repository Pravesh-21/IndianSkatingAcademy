interface EnquiryDetails {
  name: string;
  age: number;
  dob: string;
  phone: string;
  email: string;
  discipline: string;
  source: string;
  method: string;
}

const DISCIPLINE_LABELS: Record<string, string> = {
  speed:      'Speed Skating',
  artistic:   'Artistic Freestyle',
  slalom:     'Slalom',
  aggressive: 'Aggressive / Stunt',
};

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

export async function sendEnquiryEmail(details: EnquiryDetails): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey === 'your_brevo_api_key_here') {
    console.warn('[Brevo] API key not configured — skipping email send');
    return;
  }

  const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const disciplineLabel = DISCIPLINE_LABELS[details.discipline] ?? details.discipline;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: #0f172a; padding: 24px; text-align: center;">
        <h1 style="color: #fff; font-size: 20px; margin: 0;">🛼 Indian Skating Academy</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0;">New Join Enquiry Received</p>
      </div>
      <div style="padding: 24px; background: #fff;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Name</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Age</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.age}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Phone</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Discipline</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${disciplineLabel}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">DOB</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.dob}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Email</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Source</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.source}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px; border-bottom: 1px solid #f1f5f9;">Method</td>
            <td style="padding: 10px 0; font-weight: 600; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${details.method}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; color: #6b7280; font-size: 14px;">Submitted</td>
            <td style="padding: 10px 0; font-size: 14px;">${submittedAt} IST</td>
          </tr>
        </table>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">Indian Skating Academy — Nagpur</p>
      </div>
    </div>
  `;

  const payload = {
    sender: {
      name:  process.env.EMAIL_FROM_NAME    ?? 'Indian Skating Academy',
      email: process.env.EMAIL_FROM_ADDRESS ?? 'noreply@indianskatingacademy.in',
    },
    to: [{ email: process.env.EMAIL_TO ?? 'indianskatingacademynagpur@gmail.com' }],
    subject: `New Enquiry — ${details.name} | ${disciplineLabel}`,
    htmlContent,
  };

  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'api-key':     apiKey,
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[Brevo] API error ${response.status}: ${error}`);
  }

  console.log(`[Brevo] Email sent for enquiry from ${details.name}`);
}
