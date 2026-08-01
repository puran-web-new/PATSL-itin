import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../../../lib/clientAuth';

export async function POST(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const res = NextResponse.redirect(`${origin}/portal/sign-in`);
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, maxAge: 0, path: '/' });
  return res;
}
