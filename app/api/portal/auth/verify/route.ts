import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { verifyMagicLinkToken, signSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '../../../../../lib/clientAuth';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') || '';
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  const payload = await verifyMagicLinkToken(token);
  if (!payload) {
    return NextResponse.redirect(`${origin}/portal/sign-in?error=expired`);
  }

  const { rows } = await query(`SELECT id FROM clients WHERE email = $1`, [payload.email]);
  if (!rows[0]) {
    return NextResponse.redirect(`${origin}/portal/sign-in?error=not-found`);
  }

  const session = await signSessionToken(rows[0].id, payload.email);
  const res = NextResponse.redirect(`${origin}/portal/dashboard`);
  res.cookies.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  });
  return res;
}
