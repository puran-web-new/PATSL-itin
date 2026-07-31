import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  try {
    const applicationId = req.nextUrl.searchParams.get('applicationId')?.trim() || '';
    const lastName = req.nextUrl.searchParams.get('lastName')?.trim() || '';

    if (!applicationId || !lastName) {
      return NextResponse.json({ error: 'Application ID and last name are required.' }, { status: 400 });
    }

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(applicationId)) {
      return NextResponse.json({ error: 'No matching application found.' }, { status: 404 });
    }

    const { rows } = await query(
      `SELECT a.id, a.status, a.service_tier, a.created_at, a.updated_at,
              i.payment_status,
              EXISTS(SELECT 1 FROM identity_documents d WHERE d.application_id = a.id) AS has_documents
       FROM applications a
       JOIN clients c ON c.id = a.client_id
       LEFT JOIN LATERAL (
         SELECT * FROM invoices i WHERE i.application_id = a.id ORDER BY i.created_at DESC LIMIT 1
       ) i ON TRUE
       WHERE a.id = $1 AND lower(c.last_name) = lower($2)
       LIMIT 1`,
      [applicationId, lastName]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'No matching application found. Double-check your reference ID and last name.' }, { status: 404 });
    }

    return NextResponse.json({ application: rows[0] });
  } catch (error: any) {
    console.error('Status lookup failed:', error);
    return NextResponse.json({ error: 'Unable to look up status right now. Try again shortly.' }, { status: 500 });
  }
}
