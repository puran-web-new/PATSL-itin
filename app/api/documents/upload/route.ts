import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: 'Document storage is not configured yet. You can finish payment now and email your ID to PATSL support.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const applicationId = String(formData.get('applicationId') || '').trim();
    const docType = String(formData.get('docType') || 'PASSPORT').trim();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File is too large. Maximum size is 10 MB.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Upload a JPG, PNG, WEBP, or PDF.' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const blob = await put(`identity/${applicationId}/${docType}-${Date.now()}-${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error: any) {
    console.error('Document upload failed:', error);
    return NextResponse.json({ error: error.message || 'Upload failed. Please try again.' }, { status: 500 });
  }
}
