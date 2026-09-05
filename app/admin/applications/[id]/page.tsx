'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAdminAuth } from '../../../../lib/useAdminAuth';
import AdminSidebarShell from '../../../../components/admin/AdminSidebarShell';
import CaseDataEditor from '../../../../components/admin/CaseDataEditor';
import CaseManagementPanel from '../../../../components/admin/CaseManagementPanel';

export default function PrepareApplicationPage() {
  const params = useParams<{ id: string }>();
  const { token, ready } = useAdminAuth();
  const [clientInfo, setClientInfo] = useState<{ clientId: string; firstName: string; lastName: string } | null>(null);

  if (!ready || !token) {
    return <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sm text-slate-400">Checking staff session...</div>;
  }

  return (
    <AdminSidebarShell
      title="Submitted intake & case file"
      subtitle={clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName} · one case file, every document.` : 'One case file, every document.'}
    >
      <Link
        href={clientInfo ? `/admin/clients/${clientInfo.clientId}` : '/admin/clients'}
        className="mb-4 inline-block text-xs font-semibold text-slate-500 hover:text-mint-300"
      >
        &larr; {clientInfo ? `${clientInfo.firstName} ${clientInfo.lastName}'s client file` : 'Client file'}
      </Link>

      <div className="mb-6 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-4 text-xs text-teal-200">
        Review and complete every submitted client field here. Changes populate the W-7, Certificate of Accuracy, and Form 1040 together; use this page to review the intake before generating documents.
      </div>

      <CaseManagementPanel applicationId={params.id} token={token} />

      <div className="-mx-6 -mb-6 bg-ink-950 px-6 pb-10 pt-6">
        <CaseDataEditor applicationId={params.id} token={token} onLoaded={setClientInfo} />
      </div>
    </AdminSidebarShell>
  );
}
