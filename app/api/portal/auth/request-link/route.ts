import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { signMagicLinkToken } from '../../../../../lib/clientAuth';
import { sendEmail } from '../../../../../lib/notify';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalized = String(email || '').trim().toLowerCase();
    if (!normalized) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    // Always respond the same way whether or not the email matches a client — this
    // avoids letting the sign-in form be used to probe which emails have applications
    // on file. The email is only actually sent when a match exists.
    const { rows } = await query(`SELECT id, first_name FROM clients WHERE email = $1`, [normalized]);
    if (rows[0]) {
      const token = await signMagicLinkToken(normalized);
      const origin = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
      const link = `${origin}/api/portal/auth/verify?token=${encodeURIComponent(token)}`;
      await sendEmail(
        normalized,
        'Your PATSL client portal sign-in link',
        `<p>Hi ${rows[0].first_name},</p><p>Click below to sign in to your PATSL client portal. This link expires in 15 minutes.</p><p><a href="${link}">Sign in to PATSL</a></p><p>If you didn't request this, you can ignore this email.</p>`
      );
    }

    return NextResponse.json({ success: true, message: 'If that email has an application on file, a sign-in link is on its way.' });
  } catch (error: any) {
    console.error('Magic link request failed:', error);
    return NextResponse.json({ error: 'Unable to send sign-in link right now.' }, { status: 500 });
  }
}
