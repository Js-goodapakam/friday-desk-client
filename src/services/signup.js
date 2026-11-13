import { API_BASE } from './apiBase.js';

// The browser talks only to the Engage Stay server; it never receives
// the Owner Tool service token or writes directly to the Owner database.
export async function signupRequest(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE}/api/auth/signup/${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to reach the registration service. Please try again.');
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Registration could not be completed.');
  return result;
}
