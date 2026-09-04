import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '../../../../lib/db';
import { notifyStaff, notifyStatusChange } from '../../../../lib/notify';

function verifySquareSignature(signature: string, bodyText: string) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const url = process.env.SQUARE_WEBHOOK_URL;
  if (!key || !url) return false;
  const expected = crypto.createHmac('sha256', key).update(url + bodyText).digest('base64');
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-square-hmacsha256-signature') || '';
    const bodyText = await req.text();

    if (!verifySquareSignature(signature, bodyText)) {
      return NextResponse.json({ error: 'Invalid Square webhook signature.' }, { status: 401 });
    }

    const event = JSON.parse(bodyText);
    const payment = event.data?.object?.payment;
    const orderId = payment?.order_id;

    if ((event.type === 'payment.updated' || event.type === 'payment.created') && payment?.status === 'COMPLETED' && orderId) {
      const pool = getPool();
      const db = await pool.connect();
      try {
        await db.query('BEGIN');
        const result = await db.query(
          `UPDATE invoices
           SET payment_status = 'PAID', amount_paid_cents = amount_cents, paid_at = COALESCE(paid_at, NOW())
           WHERE square_order_id = $1 AND payment_status <> 'PAID'
           RETURNING id, application_id, amount_cents`,
          [orderId]
        );

        let notifyInfo: any = null;
        if (result.rows[0]) {
          await db.query(`INSERT INTO payment_transactions (invoice_id, amount_cents, payment_method, external_reference) VALUES ($1, $2, 'Square', $3) ON CONFLICT (external_reference) DO NOTHING`, [result.rows[0].id, result.rows[0].amount_cents, payment.id || orderId,]);
        }
        if (result.rows[0]?.application_id) {
          const applicationId = result.rows[0].application_id;
          await db.query(`UPDATE applications SET status = 'CAA_REVIEW', updated_at = NOW() WHERE id = $1`, [applicationId]);
          await db.query(
            `INSERT INTO audit_events (application_id, event_type, actor, metadata)
             VALUES ($1, 'PAYMENT_PAID', 'square', $2)`,
            [applicationId, { orderId, paymentId: payment.id }]
          );
          const clientResult = await db.query(
            `SELECT c.email, c.phone, c.first_name, c.last_name, a.service_tier
             FROM applications a JOIN clients c ON c.id = a.client_id WHERE a.id = $1`,
            [applicationId]
          );
          if (clientResult.rows[0]) notifyInfo = { ...clientResult.rows[0], applicationId, amountCents: result.rows[0].amount_cents };
        }
        await db.query('COMMIT');
        if (notifyInfo) {
          notifyStatusChange({
            email: notifyInfo.email,
            phone: notifyInfo.phone,
            firstName: notifyInfo.first_name,
            applicationId: notifyInfo.applicationId,
            status: 'CAA_REVIEW',
          }).catch((err) => console.error('Client payment notification failed:', err));
          notifyStaff({
            event: 'payment_completed',
            applicationId: notifyInfo.applicationId,
            firstName: notifyInfo.first_name,
            lastName: notifyInfo.last_name,
            email: notifyInfo.email,
            phone: notifyInfo.phone,
            serviceTier: notifyInfo.service_tier,
            amountCents: notifyInfo.amountCents,
          }).catch((err) => console.error('Payment staff notification failed:', err));
        }
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      } finally {
        db.release();
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Square webhook failed:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed.' }, { status: 500 });
  }
}
