import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

// One row per client (person), not per application -- a client with three
// applications shows up once here, with the applications rolled up into
// counts and a "latest" snapshot. Full per-application detail lives on the
// client detail page (/api/admin/clients/[id]). Every rollup column below is
// either a scalar subquery or a single-row (LIMIT 1) LATERAL join, so there's
// no join fan-out risk of double-counting invoices/applications.
export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { rows } = await query(
      `SELECT
         c.id,
         c.first_name,
         c.last_name,
         c.email,
         c.phone,
         c.created_at,
         (SELECT COUNT(*) FROM applications a WHERE a.client_id = c.id)::int AS application_count,
         (SELECT COALESCE(SUM(i.amount_cents), 0)
            FROM invoices i
            JOIN applications a ON a.id = i.application_id
            WHERE a.client_id = c.id AND i.payment_status = 'PAID')::int AS total_paid_cents,
         latest.status AS latest_status,
         latest.service_tier AS latest_service_tier,
         latest.created_at AS latest_application_at
       FROM clients c
       LEFT JOIN LATERAL (
         SELECT a2.status, a2.service_tier, a2.created_at
         FROM applications a2
         WHERE a2.client_id = c.id
         ORDER BY a2.created_at DESC
         LIMIT 1
       ) latest ON TRUE
       ORDER BY latest.created_at DESC NULLS LAST
       LIMIT 200`
    );

    return NextResponse.json({ clients: rows });
  } catch (error: any) {
    console.error('Admin clients fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load clients.' }, { status: 500 });
  }
}
