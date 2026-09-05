import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { resolveApplicationId } from '../../../../lib/resolveApplicationId';

export async function GET(req: NextRequest) {
  try {
    const applicationIdParam = String(req.nextUrl.searchParams.get('applicationId') || '').trim();
    const lastName = String(req.nextUrl.searchParams.get('lastName') || '').trim();
    if (!applicationIdParam || !lastName) {
      return NextResponse.json({ error: 'Application ID and last name are required.' }, { status: 400 });
    }

    const resolvedId = await resolveApplicationId(applicationIdParam);
    if (!resolvedId) {
      return NextResponse.json({ error: 'No matching application found.' }, { status: 404 });
    }

    const { rows } = await query(
      `SELECT a.*, c.*, i.* FROM applications a
       JOIN clients c ON c.id = a.client_id
       LEFT JOIN LATERAL (
         SELECT * FROM invoices i WHERE i.application_id = a.id ORDER BY i.created_at DESC LIMIT 1
       ) i ON TRUE
       WHERE a.id = $1 AND lower(c.last_name) = lower($2)
       LIMIT 1`,
      [resolvedId, lastName]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'No matching application found.' }, { status: 404 });
    }

    return NextResponse.json({ application: rows[0] });
  } catch (error: any) {
    console.error('Application status lookup failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to lookup application.' }, { status: 500 });
  }
}
