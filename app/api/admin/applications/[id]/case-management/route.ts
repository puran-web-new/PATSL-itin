import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../../../lib/db';
import { requireAdmin } from '../../../../../../lib/security';

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    const { id } = await context.params;
    const [application, notes, history] = await Promise.all([
      getPool().query(`SELECT id, assigned_staff, archived_at, archived_reason FROM applications WHERE id = $1`, [id]),
      getPool().query(`SELECT id, body, visibility, author, created_at FROM application_notes WHERE application_id = $1 ORDER BY created_at DESC`, [id]),
      getPool().query(`SELECT id, previous_status, next_status, changed_by, created_at FROM application_status_history WHERE application_id = $1 ORDER BY created_at DESC`, [id]),
    ]);
    if (!application.rows[0]) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    return NextResponse.json({ caseManagement: application.rows[0], notes: notes.rows, history: history.rows });
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Run migration 005_case_management.sql first.' }, { status: 500 }); }
}

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req); if (denied) return denied;
  try {
    const { id } = await context.params; const body = await req.json(); const action = String(body.action || '');
    const db = await getPool().connect();
    try {
      await db.query('BEGIN');
      if (action === 'assign') {
        const staff = String(body.assignedStaff || '').trim().slice(0, 255);
        await db.query(`UPDATE applications SET assigned_staff = $1, updated_at = NOW() WHERE id = $2`, [staff || null, id]);
        await db.query(`INSERT INTO audit_events (application_id, event_type, actor, metadata) VALUES ($1, 'STAFF_ASSIGNED', 'admin', $2)`, [id, JSON.stringify({ assignedStaff: staff || null })]);
      } else if (action === 'note') {
        const note = String(body.note || '').trim().slice(0, 4000); const visibility = body.visibility === 'CLIENT' ? 'CLIENT' : 'INTERNAL';
        if (!note) { await db.query('ROLLBACK'); return NextResponse.json({ error: 'Note text is required.' }, { status: 400 }); }
        await db.query(`INSERT INTO application_notes (application_id, body, visibility) VALUES ($1, $2, $3)`, [id, note, visibility]);
        await db.query(`INSERT INTO audit_events (application_id, event_type, actor, metadata) VALUES ($1, 'CASE_NOTE_ADDED', 'admin', $2)`, [id, JSON.stringify({ visibility })]);
      } else if (action === 'archive' || action === 'restore') {
        const reason = String(body.reason || '').trim().slice(0, 500);
        if (action === 'archive' && !reason) { await db.query('ROLLBACK'); return NextResponse.json({ error: 'An archive reason is required.' }, { status: 400 }); }
        await db.query(`UPDATE applications SET archived_at = $1, archived_reason = $2, updated_at = NOW() WHERE id = $3`, [action === 'archive' ? new Date() : null, action === 'archive' ? reason : null, id]);
        await db.query(`INSERT INTO audit_events (application_id, event_type, actor, metadata) VALUES ($1, $2, 'admin', $3)`, [id, action === 'archive' ? 'APPLICATION_ARCHIVED' : 'APPLICATION_RESTORED', JSON.stringify({ reason: reason || null })]);
      } else { await db.query('ROLLBACK'); return NextResponse.json({ error: 'Invalid case-management action.' }, { status: 400 }); }
      await db.query('COMMIT'); return NextResponse.json({ success: true });
    } catch (error) { await db.query('ROLLBACK'); throw error; } finally { db.release(); }
  } catch (error: any) { return NextResponse.json({ error: error.message || 'Failed to update case management.' }, { status: 500 }); }
}
