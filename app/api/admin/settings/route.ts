import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getPool } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';
import { getEditableFirmProfile } from '../../../../lib/firmProfile';

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let databaseConnected = false;
  try {
    const pool = getPool();
    const db = await pool.connect();
    try {
      await db.query('SELECT 1');
      databaseConnected = true;
    } finally {
      db.release();
    }
  } catch {
    databaseConnected = false;
  }

  const templatesDir = path.join(process.cwd(), 'public', 'templates');
  const [w7Template, coaTemplate, f1040Template] = await Promise.all([
    fileExists(path.join(templatesDir, 'fW7.pdf')),
    fileExists(path.join(templatesDir, 'fw7coa.pdf')),
    fileExists(path.join(templatesDir, 'f1040.pdf')),
  ]);

  const integrations = {
    database: databaseConnected,
    squarePayments: Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID),
    documentStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID),
    adminAuth: Boolean(process.env.ADMIN_ACCESS_TOKEN),
    cronScrub: Boolean(process.env.CRON_SECRET),
    w7Template,
    coaTemplate,
    f1040Template,
  };

  return NextResponse.json({ integrations, firmProfile: await getEditableFirmProfile() });
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const profile = {
      businessName: String(body.businessName || '').trim().slice(0, 255), ein: String(body.ein || '').trim().slice(0, 40), ptin: String(body.ptin || '').trim().slice(0, 40), officeCode: String(body.officeCode || '').trim().slice(0, 80),
      reviewerName: String(body.reviewerName || '').trim().slice(0, 255), reviewerTitle: String(body.reviewerTitle || '').trim().slice(0, 255), phone: String(body.phone || '').trim().slice(0, 50), email: String(body.email || '').trim().slice(0, 255), address: String(body.address || '').trim().slice(0, 1000),
    };
    if (!profile.businessName || !profile.reviewerName || !profile.email) return NextResponse.json({ error: 'Business name, reviewer name, and email are required.' }, { status: 400 });
    await getPool().query(`INSERT INTO firm_profile (id, business_name, ein, ptin, office_code, reviewer_name, reviewer_title, phone, email, address) VALUES (TRUE, $1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET business_name = EXCLUDED.business_name, ein = EXCLUDED.ein, ptin = EXCLUDED.ptin, office_code = EXCLUDED.office_code, reviewer_name = EXCLUDED.reviewer_name, reviewer_title = EXCLUDED.reviewer_title, phone = EXCLUDED.phone, email = EXCLUDED.email, address = EXCLUDED.address, updated_at = NOW()`, [profile.businessName, profile.ein, profile.ptin, profile.officeCode, profile.reviewerName, profile.reviewerTitle, profile.phone, profile.email, profile.address]);
    return NextResponse.json({ firmProfile: profile });
  } catch (error: any) {
    console.error('Firm profile save failed:', error);
    return NextResponse.json({ error: error.message || 'Failed to save firm profile.' }, { status: 500 });
  }
}
