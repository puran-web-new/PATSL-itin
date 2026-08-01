// Email + SMS notifications. Both degrade gracefully to a console log when their
// provider credentials aren't set — same pattern as document storage and Square
// elsewhere in this app — so this is safe to deploy immediately and simply starts
// working the moment RESEND_API_KEY / TWILIO_* are added in Vercel.

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || 'PATSL <no-reply@patsl-itin-final.vercel.app>';

  if (!apiKey) {
    console.log(`[email:not-configured] would send to=${to} subject="${subject}"`);
    return false;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error('Resend send failed:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Email send failed:', err);
    return false;
  }
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from || !to) {
    console.log(`[sms:not-configured] would send to=${to} body="${body}"`);
    return false;
  }

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    });
    if (!res.ok) {
      console.error('Twilio send failed:', await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('SMS send failed:', err);
    return false;
  }
}

const STATUS_MESSAGES: Record<string, string> = {
  DOCUMENTS_RECEIVED: 'We received your identity documents — your case is moving to payment.',
  PAYMENT_PENDING: 'Your case is awaiting payment to continue.',
  CAA_REVIEW: 'Your Certified Acceptance Agent is now reviewing your case.',
  SUBMITTED_IRS: 'Your ITIN package has been finalized and is ready to be mailed to the IRS.',
  ARCHIVED_PII_SCRUBBED: 'Your case has been archived and identity documents removed per our retention policy.',
};

export async function notifyStatusChange(opts: {
  email: string;
  phone?: string | null;
  firstName: string;
  applicationId: string;
  status: string;
}) {
  const message = STATUS_MESSAGES[opts.status];
  if (!message) return; // don't notify on every internal status, only client-meaningful ones

  const trackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://patsl-itin-final.vercel.app'}/status`;
  await sendEmail(
    opts.email,
    'Update on your PATSL ITIN application',
    `<p>Hi ${opts.firstName},</p><p>${message}</p><p>Reference: <b>${opts.applicationId}</b></p><p>Track your case anytime at <a href="${trackUrl}">${trackUrl}</a>.</p><p>— PATSL</p>`
  );
  if (opts.phone) {
    await sendSms(opts.phone, `PATSL: ${message} Ref ${String(opts.applicationId).slice(0, 8)}. Track: ${trackUrl}`);
  }
}
