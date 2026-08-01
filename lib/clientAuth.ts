import { SignJWT, jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'patsl_client_session';
const MAGIC_LINK_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 30;

// Hand-rolled, stateless JWT session (via the mature `jose` library rather than an
// auth framework still in beta) — no new database table needed for magic links or
// sessions. A magic-link token is a short-lived JWT proving control of an email
// address; a session token is a longer-lived JWT proving who's signed in. Both are
// just verified signatures, so there's nothing to look up or expire server-side.
function getSecret() {
  const secret = process.env.CLIENT_SESSION_SECRET;
  if (!secret) {
    console.warn(
      'CLIENT_SESSION_SECRET is not set — falling back to an insecure development-only key. ' +
        'Set a real random value in Vercel before letting real clients sign in.'
    );
  }
  return new TextEncoder().encode(secret || 'insecure-dev-only-secret-do-not-use-in-production');
}

export async function signMagicLinkToken(email: string): Promise<string> {
  return new SignJWT({ email, purpose: 'magic-link' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAGIC_LINK_TTL_MINUTES}m`)
    .sign(getSecret());
}

export async function verifyMagicLinkToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== 'magic-link' || typeof payload.email !== 'string') return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function signSessionToken(clientId: string, email: string): Promise<string> {
  return new SignJWT({ clientId, email, purpose: 'session' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<{ clientId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.purpose !== 'session' || typeof payload.clientId !== 'string' || typeof payload.email !== 'string') return null;
    return { clientId: payload.clientId, email: payload.email };
  } catch {
    return null;
  }
}

// For use inside API route handlers (NextRequest carries its own cookie jar).
export async function getClientSession(req: NextRequest): Promise<{ clientId: string; email: string } | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_DAYS * 24 * 60 * 60;
