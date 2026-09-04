import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';
import { notifyStaff } from '../../../lib/notify';

const allowedTiers = new Set(['EXPRESS_SELF_SERVICE', 'CAA_CONCIERGE', 'B2B_PORTAL']);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 });
    }

    const serviceTier = allowedTiers.has(body.serviceTier) ? body.serviceTier : 'CAA_CONCIERGE';
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
        `INSERT INTO applications (
           client_id, exception_type, service_tier, status, date_of_birth,
           country_of_citizenship, mailing_address, foreign_address, w7_data
         ) VALUES ($1, $2, $3, 'INTAKE_STARTED', $4, $5, $6, $7, $8)
         RETURNING id, status`,
        [
          clientId,
          body.exceptionType || 'STANDARD_RETURN',
          serviceTier,
          body.dateOfBirth || null,
          body.countryOfCitizenship || null,
          body.mailingAddress || null,
          body.foreignAddress || null,
          body,
        ]
      );

      const applicationId = applicationResult.rows[0].id;
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'INTAKE_CREATED', 'client', $2)`,
        [applicationId, { email, serviceTier }]
      );
      await db.query('COMMIT');

      notifyStaff({
        event: 'intake_submitted',
        applicationId,
        firstName,
        lastName,
        email,
        phone,
        serviceTier,
      }).catch((err) => console.error('Intake staff notification failed:', err));

      return NextResponse.json({ applicationId, status: applicationResult.rows[0].status }, { status: 201 });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }
  } catch (error: any) {
    console.error('Intake creation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to create intake.' }, { status: 500 });
  }
}
