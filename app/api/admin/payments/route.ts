import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { rows } = await query(
      `SELECT i.id, i.application_id, i.client_id, i.description, i.amount_cents, i.amount_paid_cents,
              i.currency, i.payment_status, i.square_payment_link, i.created_at, i.paid_at,
              c.first_name, c.last_name, c.email, a.service_tier
       FROM invoices i
       LEFT JOIN clients c ON c.id = i.client_id
       LEFT JOIN applications a ON a.id = i.application_id
       ORDER BY i.created_at DESC LIMIT 200`
    );
    return NextResponse.json({ invoices: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to load payments.' }, { status: 500 });
  }
}
