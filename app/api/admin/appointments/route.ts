import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const result = await query(
      `SELECT id, full_name, email, phone, preferred_date, preferred_time, service_tier, status, created_at
       FROM appointments
       ORDER BY created_at DESC
       LIMIT 200`
    );
    return NextResponse.json({ appointments: result.rows });
  } catch (error: any) {
    console.error('Admin appointments fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load appointments.' }, { status: 500 });
  }
}
