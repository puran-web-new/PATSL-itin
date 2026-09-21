// Client-side persistence for the staff access token.
//
// We store it in localStorage (not sessionStorage) so a signed-in staff member
// stays signed in across page reloads AND across separate browser tabs — opening
// the console in a second tab no longer forces re-entering the token. Reads fall
// back to any legacy sessionStorage value so existing sessions aren't dropped.
const KEY = 'patsl-admin-token';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY) || window.sessionStorage.getItem(KEY);
}

export function setAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, token);
  // Clear any stale per-tab copy so the two stores can't disagree.
  window.sessionStorage.removeItem(KEY);
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
  window.sessionStorage.removeItem(KEY);
}
