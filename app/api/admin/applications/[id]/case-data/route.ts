import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { requireAdmin } from '../../../../../../lib/security';

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const caseData = body.caseData;
    if (!caseData || typeof caseData !== 'object') {
      return NextResponse.json({ error: 'caseData object is required.' }, { status: 400 });
    }

    const pool = getPool();
    const db = await pool.connect();
    try {
      await db.query('BEGIN');
      const result = await db.query(
        `UPDATE applications SET w7_data = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [JSON.stringify(caseData), id]
      );
      if (!result.rows[0]) {
        await db.query('ROLLBACK');
        return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
      }
      await db.query(
        `INSERT INTO audit_events (application_id, event_type, actor, metadata)
         VALUES ($1, 'CASE_DATA_UPDATED', 'admin', '{}'::jsonb)`,
        [id]
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
    console.error('Case data save failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to save case data.' }, { status: 500 });
  }
}
