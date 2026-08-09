import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';

const ALLOWED_STATUSES = new Set(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const status = String(body.status || '');
    if (!ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    const result = await query(`UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id, status`, [status, id]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found.' }, { status: 404 });
    }

    return NextResponse.json({ appointment: result.rows[0] });
  } catch (error: any) {
    console.error('Admin appointment update failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to update appointment.' }, { status: 500 });
  }
}
