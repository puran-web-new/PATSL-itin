import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { getPool } from '../../../lib/db';
import { requireAdmin } from '../../../lib/security';

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function safeSetText(form: any, names: string[], value: string) {
  for (const name of names) {
    try {
      form.getTextField(name).setText(value || '');
      return;
    } catch {}
  }
}

async function loadOrCreateTemplate(fileName: string, title: string) {
  const filePath = path.join(process.cwd(), 'public', 'templates', fileName);
  if (await fileExists(filePath)) {
    return PDFDocument.load(await fs.readFile(filePath));
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  page.drawText(title, { x: 50, y: 730, size: 18, font, color: rgb(0.08, 0.11, 0.18) });
  page.drawText('Template PDF not yet uploaded to public/templates.', { x: 50, y: 700, size: 11, color: rgb(0.35, 0.39, 0.45) });
  return doc;
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    const { applicationId, packageType = 'IRS_MAIL' } = await req.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required.' }, { status: 400 });
    }

    const pool = getPool();
    const db = await pool.connect();
    let app: any;
    let doc: any;

    try {
      const appResult = await db.query(
        `SELECT a.*, c.first_name, c.last_name, c.email, c.phone
         FROM applications a
         JOIN clients c ON c.id = a.client_id
         WHERE a.id = $1`,
        [applicationId]
      );
      const docResult = await db.query(
        `SELECT * FROM identity_documents WHERE application_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [applicationId]
      );
      app = appResult.rows[0];
      doc = docResult.rows[0];
    } finally {
      db.release();
    }

    if (!app) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    }

    const w7 = await loadOrCreateTemplate('fW7.pdf', 'Form W-7 Draft');
    const coa = await loadOrCreateTemplate('fw7coa.pdf', 'Certificate of Accuracy Draft');
    const f1040 = await loadOrCreateTemplate('f1040.pdf', 'Form 1040 Draft');

    for (const [pdf, kind] of [[w7, 'w7'], [coa, 'coa'], [f1040, '1040']] as const) {
      try {
        const form = pdf.getForm();
        safeSetText(form, ['Applicant_FirstName', 'f1_01[0]', 'FirstName'], app.first_name);
        safeSetText(form, ['Applicant_LastName', 'f1_02[0]', 'LastName'], app.last_name);
        safeSetText(form, ['Applicant_Email', 'Email'], app.email);
        safeSetText(form, ['Passport_Number', 'f1_19[0]'], doc?.document_number || '');
        safeSetText(form, ['Passport_Country', 'f1_20[0]'], doc?.issuing_country || app.country_of_citizenship || '');
        safeSetText(form, ['CAA_Business_Name', 'f1_14[0]'], 'Puran Accounting & Tax Solution Lab');
        form.flatten();
      } catch {
        const page = pdf.getPage(0);
        page.drawText(`${kind.toUpperCase()} package data`, { x: 50, y: 660, size: 12 });
        page.drawText(`${app.first_name} ${app.last_name}`, { x: 50, y: 640, size: 11 });
        page.drawText(app.email, { x: 50, y: 622, size: 11 });
      }
    }

    const cover = await PDFDocument.create();
    const coverPage = cover.addPage([612, 792]);
    const titleFont = await cover.embedFont(StandardFonts.HelveticaBold);
    coverPage.drawText('PATSL ITIN Package', { x: 50, y: 730, size: 22, font: titleFont });
    coverPage.drawText(`Applicant: ${app.first_name} ${app.last_name}`, { x: 50, y: 695, size: 12 });
    coverPage.drawText(`Package: ${packageType}`, { x: 50, y: 675, size: 12 });
    coverPage.drawText('Review all generated forms before submission.', { x: 50, y: 640, size: 11, color: rgb(0.55, 0.1, 0.1) });

    const sequence = packageType === 'CAA_RECORD' ? [cover, w7, coa] : [cover, w7, coa, f1040];
    const merged = await PDFDocument.create();
    for (const pdf of sequence) {
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => merged.addPage(page));
    }

    const bytes = await merged.save();
    await getPool().query(
      `INSERT INTO audit_events (application_id, event_type, actor, metadata)
       VALUES ($1, 'PACKAGE_GENERATED', 'admin', $2)`,
      [applicationId, { packageType }]
    );

    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="PATSL_${packageType}_${app.last_name}_${String(app.id).slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Package generation failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate package.' }, { status: 500 });
  }
}
