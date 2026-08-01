'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '../../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../../components/admin/AdminSidebarShell';
import CaseDataEditor from '../../../../components/admin/CaseDataEditor';

export default function PrepareApplicationPage() {
  const params = useParams<{ id: string }>();
  const { token, ready } = useAdminAuth();

  if (!ready || !token) {
    return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;
  }

  return (
    <AdminSidebarShell title="Prepare application" subtitle="One case file, every document.">
      <Link href={`/admin/clients/${params.id}`} className="mb-4 inline-block text-xs font-semibold text-slate-500 hover:text-mint-300">&larr; Client file</Link>

      <div className="mb-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-xs text-teal-200">
        Fill this once — the same data automatically populates the W-7, Certificate of Accuracy, and Form 1040
        together. Each section below is tagged with which official document(s) it feeds, so you can review
        rather than retype.
      </div>

      <div className="-mx-6 -mb-6 bg-ink-950 px-6 pb-10 pt-6">
        <CaseDataEditor applicationId={params.id} token={token} />
      </div>
    </AdminSidebarShell>
  );
}
