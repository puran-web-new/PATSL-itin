import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';

const ALLOWED_TIERS = new Set(['EXPRESS_SELF_SERVICE', 'CAA_CONCIERGE', 'B2B_PORTAL', 'SUPERIOR_STAFFING']);

// Mode B of the dual-mode entry flow: staff enters just enough to identify the
// client (name, email, phone, tier), then generates a shareable link
// (`/itin-intake?applicationId=...`) the client opens on their own device to
// finish the rest — personal details, identity documents, and payment — without
// staff re-typing anything the client will type themselves. Mode A (staff fills
// the whole case live) is the existing "Prepare Application" workspace.
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const firstName = String(body.firstName || '').trim();
    const middleName = String(body.middleName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const serviceTier = ALLOWED_TIERS.has(body.serviceTier) ? body.serviceTier : 'CAA_CONCIERGE';

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 });
    }

    const pool = getPool();
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      const clientResult = await db.query(
        `INSERT INTO clients (email, first_name, last_name, phone, updated_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (email) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           phone = EXCLUDED.phone,
           updated_at = NOW()
         RETURNING id`,
        [email, firstName, lastName, phone]
      );
      const clientId = clientResult.rows[0].id;

      const applicationResult = await db.query(
        `INSERT INTO applications (client_id, service_tier, status, w7_data)
         VALUES ($1, $2, 'INTAKE_STARTED', $3)
         RETURNING id`,
        [clientId, serviceTier, { firstName, middleName, lastName, phone, email }]
      );
      const applicationId = applicationResult.rows[0].id;

      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'INTAKE_CREATED', 'staff', $2)`,
        [applicationId, JSON.stringify({ email, serviceTier, mode: 'STAFF_DRAFT' })]
      );
      await db.query('COMMIT');

      return NextResponse.json({ applicationId });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }
  } catch (error: any) {
    console.error('Draft application creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create draft application.' }, { status: 500 });
  }
}
