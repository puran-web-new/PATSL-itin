import { NextRequest, NextResponse } from 'next/server';
import { get } from '@vercel/blob';
import { query } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/security';
import { getClientSession } from '../../../../../lib/clientAuth';

// Identity documents used to be linked to directly via their raw Vercel Blob URL —
// a long, unguessable-but-public link that worked for anyone who obtained it, with
// no expiry and no access log. This proxy replaces that: the browser only ever sees
// this same-origin URL, which requires either a valid admin session (staff) or a
// signed-in client session that owns the application the document belongs to. The
// raw Blob URL is fetched server-side and never sent to the client.
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const { rows } = await query(
    `SELECT d.storage_path, d.is_scrubbed, d.doc_type, a.client_id
     FROM identity_documents d
     JOIN applications a ON a.id = d.application_id
     WHERE d.id = $1`,
    [id]
  );
  const doc = rows[0];
  if (!doc || doc.is_scrubbed || !doc.storage_path) {
    return NextResponse.json({ error: 'Document not found or no longer available.' }, { status: 404 });
  }

  const adminDenied = requireAdmin(req);
  if (adminDenied) {
    const session = await getClientSession(req);
    if (!session || session.clientId !== doc.client_id) {
      return NextResponse.json({ error: 'Not authorized to view this document.' }, { status: 403 });
    }
  }

  // Documents are stored in a private Blob store — reading them requires the
  // SDK's authenticated get() (OIDC or BLOB_READ_WRITE_TOKEN), not a plain fetch.
  const result = await get(doc.storage_path, { access: 'private' });
  if (!result || !result.stream) {
    return NextResponse.json({ error: 'Could not retrieve the document right now.' }, { status: 502 });
  }

  return new NextResponse(result.stream, {
    status: 200,
    headers: {
      'Content-Type': result.blob.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${doc.doc_type || 'document'}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
