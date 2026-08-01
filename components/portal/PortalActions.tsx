'use client';

import { FormEvent, useState } from 'react';

export function DownloadClientCopyButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function download() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate-packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, packageType: 'CLIENT_COPY' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Could not generate your package yet.');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PATSL_Client_Copy_${applicationId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Could not generate your package yet.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={download}
        disabled={loading}
        className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-2.5 text-xs font-bold text-ink-950 hover:from-teal-400 hover:to-teal-500 disabled:opacity-50"
      >
        {loading ? 'Preparing...' : 'Download my client copy'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function UploadDocumentForm({ applicationId }: { applicationId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('PASSPORT');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('docType', docType);
      const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed.');

      const registerRes = await fetch('/api/documents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, docType, storagePath: uploadData.url }),
      });
      if (!registerRes.ok) {
        const err = await registerRes.json().catch(() => ({}));
        throw new Error(err.error || 'Upload saved, but registering it failed — contact PATSL.');
      }
      setDone(true);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full rounded-lg border border-slate-300 p-2.5 text-xs">
        <option value="PASSPORT">Passport</option>
        <option value="NATIONAL_ID">National ID</option>
        <option value="DRIVERS_LICENSE">Driver's license / State ID</option>
        <option value="USCIS">USCIS documentation</option>
        <option value="OTHER">Other</option>
      </select>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-xs"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {done && <p className="text-xs font-semibold text-teal-700">Uploaded — your preparer will review it shortly.</p>}
      <button disabled={!file || uploading} className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-ink-900 hover:bg-slate-50 disabled:opacity-50">
        {uploading ? 'Uploading...' : 'Upload document'}
      </button>
    </form>
  );
}
