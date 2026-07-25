import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';
import { requireCron } from '../../../../lib/security';

export async function GET(req: NextRequest) {
  const denied = requireCron(req);
  if (denied) return denied;

  try {
    const pool = getPool();
    const db = await pool.connect();
    let scrubbedDocuments = 0;
    let archivedApplications = 0;

    try {
      await db.query('BEGIN');
      const appResult = await db.query(
        `UPDATE applications
         SET status = 'ARCHIVED_PII_SCRUBBED', updated_at = NOW()
         WHERE updated_at < NOW() - INTERVAL '90 days'
           AND status NOT IN ('SUBMITTED_IRS', 'ARCHIVED_PII_SCRUBBED')
         RETURNING id`
      );
      archivedApplications = appResult.rowCount || 0;

      const docResult = await db.query(
        `UPDATE identity_documents
         SET document_number = 'REDACTED_PII',
             storage_path = 'REDACTED_PURGED',
             ocr_confidence = 0.0000,
             is_scrubbed = TRUE,
             verification_status = 'ARCHIVED_PII_SCRUBBED'
         WHERE created_at < NOW() - INTERVAL '90 days'
           AND is_scrubbed = FALSE
         RETURNING application_id`
      );
      scrubbedDocuments = docResult.rowCount || 0;

      for (const row of docResult.rows) {
        await db.query(
          `INSERT INTO audit_events (application_id, event_type, actor, metadata)
           VALUES ($1, 'PII_SCRUBBED', 'cron', '{}'::jsonb)`,
          [row.application_id]
        );
      }
      await db.query('COMMIT');
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      db.release();
    }

    return NextResponse.json({ success: true, archivedApplications, scrubbedDocuments });
  } catch (error: any) {
    console.error('PII scrub cron failed:', error);
    return NextResponse.json({ error: error.message || 'PII scrub failed.' }, { status: 500 });
  }
}
