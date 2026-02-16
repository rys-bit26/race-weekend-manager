/**
 * SMS notification service using Twilio.
 * If TWILIO_ACCOUNT_SID is not set, logs to console instead.
 */

interface SendSmsParams {
  to: string;
  body: string;
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

export async function sendSms({ to, body }: SendSmsParams): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log(`📱 [SMS-DRY-RUN] To: ${to} | Body: ${body}`);
    return true;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_FROM_NUMBER,
        Body: body,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error(`SMS send failed (${res.status}):`, error);
      return false;
    }

    console.log(`📱 SMS sent to ${to}: ${body.slice(0, 50)}...`);
    return true;
  } catch (err) {
    console.error('SMS send error:', err);
    return false;
  }
}
