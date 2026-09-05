@@
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
@@
   return sendEmail(
     recipient,
     `${opts.event === 'payment_completed' ? 'Payment received' : 'New intake submitted'} — PATSL`,
     `cpstrong${escapeHtml(opts.firstName)} ${escapeHtml(opts.lastName)}/strong ${opts.event === 'payment_completed' ? 'completed a payment.' : 'submitted an intake.'}/p
      ul
        liApplication reference: ${escapeHtml(opts.applicationId)}/li
        liEmail: ${escapeHtml(opts.email)}/li
        liPhone: ${escapeHtml(opts.phone) || 'not provided'}/li
        liService tier: ${escapeHtml(opts.serviceTier) || 'not specified'}/li
        ${paymentDetails}
      /ul`,
   );
 }
+
+export async function notifyPaymentReceipt(opts: { email: string; firstName: string; applicationId: string; amountCents?: number; paymentId?: string; orderId?: string; invoiceId?: number | null }) {
+  if (!opts.email) return false;
+  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://itin.patsl.org';
+  const amount = typeof opts.amountCents === 'number' ? `$${(opts.amountCents / 100).toFixed(2)}` : 'an amount';
+  const receiptHtml = `<p>Hi ${escapeHtml(opts.firstName)},</p>
+    <p>We received your payment of <strong>${escapeHtml(amount)}</strong> for application <strong>${applicationReference(opts.applicationId)}</strong>.</p>
+    ${opts.invoiceId ? `<p>Your invoice number: <strong>#${opts.invoiceId}</strong></p>` : ''}
+    ${opts.orderId ? `<p>Order ID: ${escapeHtml(opts.orderId)}</p>` : ''}
+    ${opts.paymentId ? `<p>Payment ID: ${escapeHtml(opts.paymentId)}</p>` : ''}
+    <p>You can view your case at <a href="${origin}/portal/sign-in">your secure client portal</a>.</p>
+    <p>— PATSL</p>`;
+
+  await sendEmail(opts.email, 'PATSL payment receipt', receiptHtml);
+  return true;
+}
