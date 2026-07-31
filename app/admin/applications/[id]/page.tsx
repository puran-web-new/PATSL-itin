'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CaseDataEditor from '../../../../components/admin/CaseDataEditor';

export default function PrepareApplicationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem('patsl-admin-token');
    if (!saved) {
      router.replace('/admin');
      return;
    }
    setToken(saved);
  }, [router]);

  if (!token) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;
  }

  return (
    <main className="min-h-screen bg-ink-950 px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-2 border-b border-slate-800 pb-6">
          <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-slate-300">&larr; Admin queue</Link>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">Prepare Application</p>
          <h1 className="text-3xl font-bold text-white">One case file, every document</h1>
          <p className="text-sm text-slate-400">
            Fill this once — the same data populates the W-7, Certificate of Accuracy, and Form 1040 when you
            generate a package.
          </p>
        </div>
        <CaseDataEditor applicationId={params.id} token={token} />
      </div>
    </main>
  );
}
