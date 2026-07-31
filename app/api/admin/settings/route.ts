import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getPool } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/security';
import { getFirmProfile } from '../../../../lib/firmProfile';

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
    documentStorage: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    adminAuth: Boolean(process.env.ADMIN_ACCESS_TOKEN),
    cronScrub: Boolean(process.env.CRON_SECRET),
    w7Template,
    coaTemplate,
    f1040Template,
  };

  return NextResponse.json({ integrations, firmProfile: getFirmProfile() });
}
