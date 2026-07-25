import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool } from '../../../../lib/db';

const prices: Record<string, { amount: number; name: string }> = {
  EXPRESS_SELF_SERVICE: { amount: 14900, name: 'Express ITIN Prep - Self Service' },
  CAA_CONCIERGE: { amount: 34900, name: 'CAA Concierge ITIN Package' },
  B2B_PORTAL: { amount: 9900, name: 'Partner Portal Wholesale ITIN Filing' },
};

function squareBaseUrl() {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export async function POST(req: NextRequest) {
  try {
    const { applicationId, serviceTier = 'CAA_CONCIERGE' } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    const tier = prices[serviceTier] ? serviceTier : 'CAA_CONCIERGE';
    const selected = prices[tier];

    let checkoutUrl: string | null = null;
    let squareOrderId: string | null = null;

    if (process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID) {
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
            name: selected.name,
            price_money: { amount: selected.amount, currency: 'USD' },
            location_id: process.env.SQUARE_LOCATION_ID,
          },
          checkout_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin}/itin-intake?success=true&applicationId=${applicationId}`,
          },
          pre_populated_data: {},
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        return NextResponse.json({ error: 'Square payment link creation failed.', details: payload }, { status: 502 });
      }
      checkoutUrl = payload.payment_link?.url || null;
      squareOrderId = payload.payment_link?.order_id || null;
    }

    const pool = getPool();
    const db = await pool.connect();

    try {
      await db.query('BEGIN');
      const invoice = await db.query(
        `INSERT INTO invoices (application_id, square_order_id, square_payment_link, amount_cents, payment_status)
         VALUES ($1, $2, $3, $4, 'PENDING')
         RETURNING id`,
        [applicationId, squareOrderId, checkoutUrl, selected.amount]
      );
      await db.query(`UPDATE applications SET status = 'PAYMENT_PENDING', updated_at = NOW() WHERE id = $1`, [applicationId]);
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'PAYMENT_LINK_CREATED', 'system', $2)`,
        [applicationId, { invoiceId: invoice.rows[0].id, serviceTier: tier, squareOrderId }]
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }

    return NextResponse.json({ checkoutUrl, squareOrderId, amountCents: selected.amount });
  } catch (error: any) {
    console.error('Payment link route failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create payment link.' }, { status: 500 });
  }
}
