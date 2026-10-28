// In production the client and API share the client origin through Vercel rewrites.
// This keeps the HttpOnly session cookie first-party while local development can
// still use an explicitly configured API base URL.
export const API_BASE = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  : '';
