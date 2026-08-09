import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';
import { getFirmProfile } from '../../../lib/firmProfile';
import { sendEmail } from '../../../lib/notify';

const allowedTiers = new Set(['EXPRESS_SELF_SERVICE', 'CAA_CONCIERGE', 'B2B_PORTAL']);

// Public endpoint: anyone on the Appointment page can request a verification
// visit. No auth — this is a lead-capture form, same trust level as the
// public intake form. Staff review/manage requests from the admin console.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim() || null;
    const preferredDate = body.preferredDate ? String(body.preferredDate) : null;
    const preferredTime = body.preferredTime ? String(body.preferredTime) : null;
    const serviceTier = allowedTiers.has(body.serviceTier) ? body.serviceTier : null;

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Full name and email are required.' }, { status: 400 });
    }

    const result = await getPool().query(
      `INSERT INTO appointments (full_name, email, phone, preferred_date, preferred_time, service_tier)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [fullName, email, phone, preferredDate, preferredTime, serviceTier]
    );

    const firm = getFirmProfile();
    if (firm.email) {
      await sendEmail(
        firm.email,
        'New appointment request — PATSL',
        `<p><strong>${fullName}</strong> requested a verification appointment.</p>
         <ul>
           <li>Email: ${email}</li>
           <li>Phone: ${phone || 'not provided'}</li>
           <li>Preferred date/time: ${preferredDate || 'not specified'} ${preferredTime || ''}</li>
           <li>Service tier: ${serviceTier || 'not specified'}</li>
         </ul>`
      );
    }

    return NextResponse.json({ id: result.rows[0].id, status: 'REQUESTED' }, { status: 201 });
  } catch (error: any) {
    console.error('Appointment request failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit appointment request.' }, { status: 500 });
  }
}
