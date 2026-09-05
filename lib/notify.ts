import { applicationReference } from './applicationReference';

// Email + SMS notifications. Both degrade gracefully to a console log when their
// provider credentials aren't set — same pattern as document storage and Square
// elsewhere in this app — so this is safe to deploy immediately and simply starts
// working the moment RESEND_API_KEY / TWILIO_* are added in Vercel.

function escapeHtml(value: string | null | undefined) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] || char);
}

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
    `<p>Hi ${opts.firstName},</p><p>${message}</p><p>Reference: <b>${applicationReference(opts.applicationId)}</b></p><p>Track your case anytime at <a href="${trackUrl}">${trackUrl}</a>.</p><p>— PATSL</p>`
  );
  if (opts.phone) {
    await sendSms(opts.phone, `PATSL: ${message} Ref ${String(opts.applicationId).slice(0, 8)}. Track: ${trackUrl}`);
  }
}


export async function notifyPaymentReceipt(opts: { email: string; firstName: string; applicationId: string; amountCents: number }) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://itin.patsl.org';
  return sendEmail(
    opts.email,
    'PATSL payment receipt',
    `<p>Hi ${escapeHtml(opts.firstName)},</p><p>Thank you. We received your payment of <strong>$${(opts.amountCents / 100).toFixed(2)}</strong>.</p><p>Application reference: <strong>${applicationReference(opts.applicationId)}</strong>.</p><p>Your case is now in review. <a href="${origin}/portal/sign-in">Open your secure client portal</a>.</p><p>— PATSL</p>`
  );
}

export async function notifyStaff(opts: {
  event: 'intake_submitted' | 'payment_completed';
  applicationId: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  serviceTier?: string | null;
  amountCents?: number | null;
}) {
  const recipient = process.env.CAA_EMAIL;
  if (!recipient) return false;

  const paymentDetails = opts.event === 'payment_completed'
    ? `<li>Amount paid: ${typeof opts.amountCents === 'number' ? `$${(opts.amountCents / 100).toFixed(2)}` : 'not available'}</li>`
    : '';
  return sendEmail(
    recipient,
    `${opts.event === 'payment_completed' ? 'Payment received' : 'New intake submitted'} — PATSL`,
    `<p><strong>${escapeHtml(opts.firstName)} ${escapeHtml(opts.lastName)}</strong> ${opts.event === 'payment_completed' ? 'completed a payment.' : 'submitted an intake.'}</p>
     <ul>
       <li>Application reference: ${escapeHtml(opts.applicationId)}</li>
       <li>Email: ${escapeHtml(opts.email)}</li>
       <li>Phone: ${escapeHtml(opts.phone) || 'not provided'}</li>
       <li>Service tier: ${escapeHtml(opts.serviceTier) || 'not specified'}</li>
       ${paymentDetails}
     </ul>`
  );
}


export async function notifyPackageReady(opts: { email: string; firstName: string; applicationId: string; amountCents?: number | null; paymentLink?: string | null }) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://itin.patsl.org';
  const paymentRequest = opts.paymentLink && typeof opts.amountCents === 'number'
    ? `<p>Your current balance is <strong>$${(opts.amountCents / 100).toFixed(2)}</strong>. <a href="${opts.paymentLink}">Pay securely now</a>.</p>`
    : '';
  return sendEmail(
    opts.email,
    'Your PATSL client package is ready',
    `<p>Hi ${escapeHtml(opts.firstName)},</p><p>Your ITIN client package is ready for secure download.</p>${paymentRequest}<p><a href="${origin}/portal/sign-in">Open your secure client portal</a></p><p>Sign in with this email address to download your package. Reference: <strong>${applicationReference(opts.applicationId)}</strong>.</p><p>For help, contact Puran Accounting &amp; Tax Solution Lab at <a href="mailto:info@puranaccounting.com">info@puranaccounting.com</a> or 929-468-3527.</p>`
  );
}
