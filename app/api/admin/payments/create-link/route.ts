import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '../../../../../lib/db';
import { applicationReference } from '../../../../../lib/applicationReference';
import { sendEmail } from '../../../../../lib/notify';
import { requireAdmin } from '../../../../../lib/security';

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const applicationId = String(body.applicationId || '').trim();
    const amountCents = Math.round(Number(body.amount) * 100);
    const description = String(body.description || 'PATSL ITIN service fee').trim().slice(0, 120);

    if (!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(applicationId)) {
      return NextResponse.json({ error: 'A valid application is required.' }, { status: 400 });
    }
    if (!Number.isSafeInteger(amountCents) || amountCents < 100 || amountCents > 1000000) {
      return NextResponse.json({ error: 'Enter an amount between $1.00 and $10,000.00.' }, { status: 400 });
    }
    if (!process.env.SQUARE_ACCESS_TOKEN || !process.env.SQUARE_LOCATION_ID) {
      return NextResponse.json({ error: 'Square payment settings are not configured.' }, { status: 503 });
    }

    const pool = getPool();
    const db = await pool.connect();
    try {
      const clientResult = await db.query(
        `SELECT a.id, c.email, c.first_name FROM applications a JOIN clients c ON c.id = a.client_id WHERE a.id = $1`,
        [applicationId]
      );
      const client = clientResult.rows[0];
      if (!client) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

      const response = await fetch(`${squareBaseUrl()}/v2/online-checkout/payment-links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
          'Square-Version': '2024-07-17',
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          quick_pay: {
            name: description || 'PATSL ITIN service fee',
            price_money: { amount: amountCents, currency: 'USD' },
            location_id: process.env.SQUARE_LOCATION_ID,
          },
          checkout_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/status`,
          },
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.payment_link?.url || !payload.payment_link?.order_id) {
        return NextResponse.json({ error: 'Square payment link creation failed.' }, { status: 502 });
      }

      await db.query('BEGIN');
      const invoice = await db.query(
        `INSERT INTO invoices (application_id, square_order_id, square_payment_link, amount_cents, payment_status)
         VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id`,
        [applicationId, payload.payment_link.order_id, payload.payment_link.url, amountCents]
      );
      await db.query(`UPDATE applications SET status = 'PAYMENT_PENDING', updated_at = NOW() WHERE id = $1`, [applicationId]);
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'PAYMENT_LINK_CREATED', 'admin', $2)`,
        [applicationId, { invoiceId: invoice.rows[0].id, squareOrderId: payload.payment_link.order_id, amountCents, description }]
      );
      await db.query('COMMIT');

      const emailSent = await sendEmail(
        client.email,
        'Your PATSL payment link',
        `<p>Hi ${client.first_name},</p><p>Please use the secure link below to pay your PATSL service fee of <strong>$${(amountCents / 100).toFixed(2)}</strong>.</p><p><a href="${payload.payment_link.url}">Pay securely</a></p><p>Application reference: <strong>${applicationReference(applicationId)}</strong></p><p>— PATSL</p>`
      );
      return NextResponse.json({ checkoutUrl: payload.payment_link.url, emailSent, amountCents });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }
  } catch (error: any) {
    console.error('Admin payment link creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment link.' }, { status: 500 });
  }
}
