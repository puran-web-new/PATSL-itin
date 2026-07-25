import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function requireAdmin(req: NextRequest) {
  const expected = process.env.ADMIN_ACCESS_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: 'ADMIN_ACCESS_TOKEN is not configured' }, { status: 503 });
  }
  const provided = req.headers.get('x-admin-token') || req.nextUrl.searchParams.get('adminToken') || '';
  if (!provided || !safeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized admin request' }, { status: 401 });
  }
  return null;
}

export function requireCron(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return null;
  const bearer = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  if (!bearer || !safeEqual(bearer, expected)) {
    return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
  }
  return null;
}
