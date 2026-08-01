// Shared helper for admin pages: fetches an identity document through the
// authenticated proxy (never exposing the raw storage URL to the browser) and
// opens it in a new tab as a short-lived blob: URL.
export async function viewDocument(documentId: string, token: string) {
  const res = await fetch(`/api/documents/${documentId}/file`, { headers: { 'x-admin-token': token } });
  if (!res.ok) {
    window.alert('Could not open this document right now.');
    return;
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
}
