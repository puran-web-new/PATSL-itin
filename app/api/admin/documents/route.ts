import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { rows } = await query(
      `SELECT
         d.id,
         d.application_id,
         d.doc_type,
         d.document_number,
         d.issuing_country,
         d.expiration_date,
         d.ocr_confidence,
         d.storage_path,
         d.verification_status,
         d.is_scrubbed,
         d.created_at,
         a.status AS application_status,
         a.client_id,
         c.first_name,
         c.last_name,
         c.email
       FROM identity_documents d
       JOIN applications a ON a.id = d.application_id
       JOIN clients c ON c.id = a.client_id
       ORDER BY d.created_at DESC
       LIMIT 200`
    );

    return NextResponse.json({ documents: rows });
  } catch (error: any) {
    console.error('Admin documents fetch failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to load documents.' }, { status: 500 });
  }
}
