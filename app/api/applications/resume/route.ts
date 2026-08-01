import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

// Powers a client opening a staff-generated intake link. Deliberately returns
// only prefill-safe fields (name/email/phone/tier/status) — no identity, address,
// or financial data — the same restraint the /status lookup applies, since the
// application ID alone (an unguessable UUID) is what gates access here, with no
// second factor like the status page's last-name check.
export async function GET(req: NextRequest) {
  try {
    const applicationId = req.nextUrl.searchParams.get('applicationId')?.trim() || '';
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidPattern.test(applicationId)) {
      return NextResponse.json({ error: 'Invalid application reference.' }, { status: 400 });
    }

    const { rows } = await query(
      `SELECT a.id, a.status, a.service_tier, c.first_name, c.last_name, c.email, c.phone
       FROM applications a
       JOIN clients c ON c.id = a.client_id
       WHERE a.id = $1 AND a.status != 'ARCHIVED_PII_SCRUBBED'
       LIMIT 1`,
      [applicationId]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'This application link is no longer valid.' }, { status: 404 });
    }

    return NextResponse.json({ application: rows[0] });
  } catch (error: any) {
    console.error('Application resume lookup failed:', error);
    return NextResponse.json({ error: 'Unable to load this application right now.' }, { status: 500 });
  }
}
