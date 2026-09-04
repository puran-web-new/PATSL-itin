export function applicationReference(applicationId: string) {
  return `PATSL-${applicationId.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}

export function referencePrefix(reference: string) {
  const normalized = reference.trim().toUpperCase();
  if (!/^PATSL-[0-9A-F]{10}$/.test(normalized)) return null;
  return normalized.slice('PATSL-'.length).toLowerCase();
}
