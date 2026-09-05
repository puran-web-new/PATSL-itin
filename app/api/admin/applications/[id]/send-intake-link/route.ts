import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { sendEmail } from '../../../../../../lib/notify';
import { requireAdmin } from '../../../../../../lib/security';

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const { rows } = await getPool().query(
      `SELECT a.id, c.first_name, c.email FROM applications a JOIN clients c ON c.id = a.client_id WHERE a.id = $1`,
      [id]
    );
    const application = rows[0];
    if (!application) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const intakeUrl = `${origin}/itin-intake?applicationId=${application.id}`;
    const emailSent = await sendEmail(
      application.email,
      'Complete your PATSL ITIN application',
      `<p>Hi ${application.first_name},</p><p>Your PATSL ITIN application has been started. Use the secure link below to complete your information, upload documents, and proceed to payment.</p><p><a href="${intakeUrl}">Complete your application</a></p><p>If you need help, contact PATSL.</p>`
    );
    if (!emailSent) return NextResponse.json({ error: 'Email provider did not accept the message. Check the configured sender domain and API key.' }, { status: 502 });

    await getPool().query(
      `INSERT INTO audit_events (application_id, event_type, actor, metadata) VALUES ($1, 'INTAKE_LINK_EMAILED', 'admin', $2)`,
      [application.id, JSON.stringify({ email: application.email })]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Intake-link email failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to email intake link.' }, { status: 500 });
  }
}
