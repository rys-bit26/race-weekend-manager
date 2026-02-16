/**
 * Email notification service using Resend.
 * If RESEND_API_KEY is not set, logs to console instead.
 */

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'schedule@race-weekend.app';

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.log(`📧 [EMAIL-DRY-RUN] To: ${to} | Subject: ${subject}`);
    console.log(`   Body preview: ${html.slice(0, 200)}...`);
    return true;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`Email send failed (${res.status}):`, error);
      return false;
    }

    console.log(`📧 Email sent to ${to}: ${subject}`);
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}
