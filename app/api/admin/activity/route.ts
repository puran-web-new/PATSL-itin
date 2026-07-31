import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { rows } = await query(
      `SELECT ae.id, ae.event_type, ae.actor, ae.created_at, ae.application_id,
              c.first_name, c.last_name
       FROM audit_events ae
       LEFT JOIN applications a ON a.id = ae.application_id
       LEFT JOIN clients c ON c.id = a.client_id
       ORDER BY ae.created_at DESC
       LIMIT 25`
    );
    return NextResponse.json({ activity: rows });
  } catch (error: any) {
    console.error('Admin activity fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load activity.' }, { status: 500 });
  }
}
