'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Shared by every /admin/* page: reads the staff token from sessionStorage and
// bounces to the sign-in screen (/admin) if it's missing. Keeps the same
// lightweight token-header auth used by every /api/admin/* route.
export function useAdminAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const saved = window.sessionStorage.getItem('patsl-admin-token');
    if (!saved) {
      router.replace('/admin');
      return;
    }
    setToken(saved);
    setChecked(true);
  }, [router]);

  return { token, ready: checked && !!token };
}
