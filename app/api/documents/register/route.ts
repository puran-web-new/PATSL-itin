import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const applicationId = String(body.applicationId || '').trim();
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    const pool = getPool();
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      await db.query(
        `INSERT INTO identity_documents (
           application_id, doc_type, document_number, issuing_country,
           expiration_date, ocr_confidence, storage_path, verification_status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          applicationId,
          body.docType || 'PASSPORT',
          body.documentNumber || null,
          body.issuingCountry || null,
          body.expirationDate || null,
          body.ocrConfidence || null,
          body.storagePath || null,
          body.verificationStatus || 'PENDING_REVIEW',
        ]
      );
      await db.query(`UPDATE applications SET status = 'DOCUMENTS_RECEIVED', updated_at = NOW() WHERE id = $1`, [applicationId]);
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'DOCUMENT_REGISTERED', 'system', $2)`,
        [applicationId, { docType: body.docType || 'PASSPORT', verificationStatus: body.verificationStatus || 'PENDING_REVIEW' }]
      );
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Document registration failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to register document.' }, { status: 500 });
  }
}
