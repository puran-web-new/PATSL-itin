import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { rows } = await query(
      `SELECT i.id, i.application_id, i.amount_cents, i.currency, i.payment_status, i.paid_at, i.created_at,
              c.first_name, c.last_name, c.email
       FROM invoices i
       JOIN applications a ON a.id = i.application_id
       JOIN clients c ON c.id = a.client_id
       ORDER BY i.created_at DESC
       LIMIT 200`
    );
    return NextResponse.json({ invoices: rows });
  } catch (error: any) {
    console.error('Admin invoices fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load invoices.' }, { status: 500 });
  }
}
