import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../lib/security';
import { getFirmProfile } from '../../../../lib/firmProfile';

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  return NextResponse.json({ firmProfile: getFirmProfile() });
}
