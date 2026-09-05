import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { query } from '../../../lib/db';
import { verifySessionToken, SESSION_COOKIE } from '../../../lib/clientAuth';
import { DownloadClientCopyButton, UploadDocumentForm } from '../../../components/portal/PortalActions';
import { applicationReference } from '../../../lib/applicationReference';

const STEP_ORDER = ['INTAKE_STARTED', 'DOCUMENTS_RECEIVED', 'PAYMENT_PENDING', 'CAA_REVIEW', 'PACKAGE_READY', 'SUBMITTED_IRS'];
const STEP_LABELS: Record<string, string> = {
  INTAKE_STARTED: 'Intake started',
  DOCUMENTS_RECEIVED: 'Documents received',
  PAYMENT_PENDING: 'Payment complete',
  CAA_REVIEW: 'In review',
  PACKAGE_READY: 'Package ready for client',
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
        `SELECT application_id, amount_cents, amount_paid_cents, currency, payment_status, square_payment_link, created_at FROM invoices WHERE application_id = ANY($1) ORDER BY created_at DESC`,
        [applicationIds]
      ),
    ]);
    documents = docsResult.rows;
    invoices = invoicesResult.rows;
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-abyss py-10">
      <div className="bg-dot-grid absolute inset-0 opacity-30" />
      <div className="container-page relative">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="label-mono text-[11px] font-semibold uppercase text-mint-400">Client Portal</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Welcome back, {session!.email}</h1>
          </div>
          <form action="/api/portal/auth/sign-out" method="POST">
            <button className="btn-pill-ghost px-4 py-2 text-xs">Sign out</button>
          </form>
        </div>

        {applications.length === 0 && (
          <div className="glass-card p-8 text-center">
            <p className="text-sm text-slate-400">No applications found for this account yet.</p>
            <Link href="/itin-intake" className="btn-pill-primary mt-4 inline-flex">
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
            const progressPct = archived ? 100 : activeIndex >= 0 ? Math.round(((activeIndex + 1) / STEP_ORDER.length) * 100) : 0;

            return (
              <div key={app.id} className="glass-card p-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">Reference {applicationReference(app.id)}</p>
                    <p className="text-sm font-bold capitalize text-white">{app.service_tier?.toLowerCase().replace(/_/g, ' ')}</p>
                  </div>
                  <span className="rounded-full border border-mint-500/30 bg-mint-500/10 px-3 py-1 text-xs font-bold text-mint-300">
                    {STEP_LABELS[app.status] || app.status}
                  </span>
                </div>

                <div className="mb-5">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-mint-500 to-teal-400"
                      style={{ width: `${progressPct}%`, boxShadow: '0 0 10px 1px rgba(16,185,129,0.55)' }}
                    />
                  </div>
                </div>

                {!archived ? (
                  <ol className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {STEP_ORDER.map((step, index) => {
                      const done = activeIndex >= 0 && index <= activeIndex;
                      return (
                        <li key={step} className={`rounded-lg border p-2 text-center text-[10.5px] font-semibold ${done ? 'border-mint-500/50 bg-mint-500/10 text-mint-300' : 'border-white/10 text-slate-500'}`}>
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
                    <p className="label-mono mb-2 text-[10px] font-bold uppercase text-slate-500">Documents</p>
                    <div className="space-y-1.5">
                      {appDocs.length === 0 && <p className="text-xs text-slate-500">None uploaded yet.</p>}
                      {appDocs.map((d) => (
                        <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-300">
                          <span>{d.doc_type.replace(/_/g, ' ')}</span>
                          {!d.is_scrubbed && (
                            <a href={`/api/documents/${d.id}/file`} target="_blank" rel="noreferrer" className="font-semibold text-mint-400 hover:underline">View</a>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <UploadDocumentForm applicationId={app.id} />
                    </div>
                  </div>

                  <div>
                    <p className="label-mono mb-2 text-[10px] font-bold uppercase text-slate-500">Payment</p>
                    {appInvoice ? (
                      <div className="rounded-lg border border-white/10 p-3 text-xs">
                        <p className="font-bold text-white">${(appInvoice.amount_cents / 100).toFixed(2)} {appInvoice.currency}</p>
                        <p className="mt-1 capitalize text-slate-500">{appInvoice.payment_status.toLowerCase()}</p>
                        {appInvoice.payment_status !== 'PAID' && appInvoice.square_payment_link && (
                          <div className="mt-3 border-t border-white/10 pt-3">
                            <p className="mb-2 text-slate-300">Payment is required to continue your application. Amount due: <strong className="text-white">${((appInvoice.amount_cents - (appInvoice.amount_paid_cents || 0)) / 100).toFixed(2)}</strong>.</p>
                            <a href={appInvoice.square_payment_link} className="btn-pill-primary inline-flex px-4 py-2 text-xs">Pay securely with Square</a>
                            <p className="mt-2 text-[10.5px] text-slate-500">Cards accepted. Apple Pay and eligible wallet options appear automatically on supported devices.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No invoice yet.</p>
                    )}
                  </div>

                  <div>
                    <p className="label-mono mb-2 text-[10px] font-bold uppercase text-slate-500">Your client package</p>
                    {['PACKAGE_READY', 'SUBMITTED_IRS'].includes(app.status) ? (
                      <DownloadClientCopyButton applicationId={app.id} />
                    ) : (
                      <p className="text-xs text-slate-500">Your package will appear here after PATSL completes the final review.</p>
                    )}
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
