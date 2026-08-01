import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { query } from '../../../lib/db';
import { verifySessionToken, SESSION_COOKIE } from '../../../lib/clientAuth';
import { DownloadClientCopyButton, UploadDocumentForm } from '../../../components/portal/PortalActions';

const STEP_ORDER = ['INTAKE_STARTED', 'DOCUMENTS_RECEIVED', 'PAYMENT_PENDING', 'CAA_REVIEW', 'SUBMITTED_IRS'];
const STEP_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Intake started',
  DOCUMENTS_RECEIVED: 'Documents received',
  PAYMENT_PENDING: 'Payment complete',
  CAA_REVIEW: 'In review',
  SUBMITTED_IRS: 'Submitted to IRS',
  ARCHIVED_PII_SCRUBBED: 'Case closed & archived',
};

export default async function PortalDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) {
    redirect('/portal/sign-in');
  }

  const { rows: applications } = await query(
    `SELECT id, status, service_tier, created_at FROM applications WHERE client_id = $1 ORDER BY created_at DESC`,
    [session!.clientId]
  );

  const applicationIds = applications.map((a: any) => a.id);
  let documents: any[] = [];
  let invoices: any[] = [];
  if (applicationIds.length > 0) {
    const [docsResult, invoicesResult] = await Promise.all([
      query(
        `SELECT id, application_id, doc_type, verification_status, is_scrubbed, created_at FROM identity_documents WHERE application_id = ANY($1) ORDER BY created_at DESC`,
        [applicationIds]
      ),
      query(
        `SELECT application_id, amount_cents, currency, payment_status, created_at FROM invoices WHERE application_id = ANY($1) ORDER BY created_at DESC`,
        [applicationIds]
      ),
    ]);
    documents = docsResult.rows;
    invoices = invoicesResult.rows;
  }

  return (
    <section className="min-h-screen bg-ink-50 py-10">
      <div className="container-page">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">Client Portal</p>
            <h1 className="mt-1 text-2xl font-bold text-ink-900">Welcome back, {session!.email}</h1>
          </div>
          <form action="/api/portal/auth/sign-out" method="POST">
            <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-ink-900 hover:bg-slate-50">Sign out</button>
          </form>
        </div>

        {applications.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-card">
            <p className="text-sm text-slate-600">No applications found for this account yet.</p>
            <Link href="/itin-intake" className="mt-4 inline-block rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-ink-950">
              Start an application
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {applications.map((app: any) => {
            const activeIndex = STEP_ORDER.indexOf(app.status);
            const archived = app.status === 'ARCHIVED_PII_SCRUBBED';
            const appDocs = documents.filter((d) => d.application_id === app.id);
            const appInvoice = invoices.find((i) => i.application_id === app.id);

            return (
              <div key={app.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Reference {app.id.slice(0, 8)}</p>
                    <p className="text-sm font-bold capitalize text-ink-900">{app.service_tier?.toLowerCase().replace(/_/g, ' ')}</p>
                  </div>
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">
                    {STEP_LABELS[app.status] || app.status}
                  </span>
                </div>

                {!archived ? (
                  <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {STEP_ORDER.map((step, index) => {
                      const done = activeIndex >= 0 && index <= activeIndex;
                      return (
                        <li key={step} className={`rounded-lg border p-2 text-center text-[10.5px] font-semibold ${done ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-400'}`}>
                          {STEP_LABELS[step]}
                        </li>
                      );
                    })}
                  </ol>
                ) : (
                  <p className="mb-5 text-xs text-slate-500">This case has been archived; identity documents have been scrubbed per our 90-day retention policy.</p>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Documents</p>
                    <div className="space-y-1.5">
                      {appDocs.length === 0 && <p className="text-xs text-slate-400">None uploaded yet.</p>}
                      {appDocs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2 text-xs">
                          <span>{d.doc_type.replace(/_/g, ' ')}</span>
                          {!d.is_scrubbed && (
                            <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noreferrer" className="font-semibold text-teal-700 hover:underline">View</a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <UploadDocumentForm applicationId={app.id} />
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Payment</p>
                    {appInvoice ? (
                      <div className="rounded-lg border border-slate-100 p-3 text-xs">
                        <p className="font-bold text-ink-900">${(appInvoice.amount_cents / 100).toFixed(2)} {appInvoice.currency}</p>
                        <p className="mt-1 capitalize text-slate-500">{appInvoice.payment_status.toLowerCase()}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">No invoice yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">Your documents</p>
                    <DownloadClientCopyButton applicationId={app.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
