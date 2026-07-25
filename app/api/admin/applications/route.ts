import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { rows } = await query(
      `SELECT
         a.id,
         a.status,
         a.service_tier,
         a.exception_type,
         a.created_at,
         c.first_name,
         c.last_name,
         c.email,
         c.phone,
         d.doc_type,
         d.document_number,
         d.ocr_confidence,
         d.verification_status,
         i.payment_status,
         i.square_payment_link
       FROM applications a
       JOIN clients c ON c.id = a.client_id
       LEFT JOIN LATERAL (
         SELECT * FROM identity_documents d
         WHERE d.application_id = a.id
         ORDER BY d.created_at DESC
         LIMIT 1
       ) d ON TRUE
       LEFT JOIN LATERAL (
         SELECT * FROM invoices i
         WHERE i.application_id = a.id
         ORDER BY i.created_at DESC
         LIMIT 1
       ) i ON TRUE
       ORDER BY a.created_at DESC
       LIMIT 100`
    );

    return NextResponse.json({ applications: rows });
  } catch (error: any) {
    console.error('Admin queue fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load applications.' }, { status: 500 });
  }
}
