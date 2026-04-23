// Auth service abstraction. Swap these implementations with real API calls
// later (e.g. fetch("/api/register"), Lovable Cloud, Supabase, etc.) without
// touching the UI components.

export type User = {
  username: string;
  // NOTE: Never store plaintext passwords in production. This is a local
  // simulation only — the backend will hash + verify server-side.
  password: string;
  createdAt: number;
};

// ---------- Validation (kept abstract / reusable) ----------

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
const USERNAME_RE = /^[a-z0-9]+$/;

export function sanitizeUsernameInput(raw: string): string {
  // Strip anything that isn't a-z or 0-9, force lowercase.
  return raw.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, USERNAME_MAX);
}

export function validateUsername(name: string): { ok: boolean; error?: string } {
  if (name.length < USERNAME_MIN) return { ok: false, error: `Min ${USERNAME_MIN} characters` };
  if (name.length > USERNAME_MAX) return { ok: false, error: `Max ${USERNAME_MAX} characters` };
  if (!USERNAME_RE.test(name)) return { ok: false, error: "Only a-z and 0-9 allowed" };
  return { ok: true };
}

export function validatePassword(pw: string): { ok: boolean; error?: string } {
  if (pw.length < 6) return { ok: false, error: "Password must be at least 6 characters" };
  if (pw.length > 64) return { ok: false, error: "Password too long" };
  return { ok: true };
}

// ---------- Local storage helpers (simulating a backend) ----------


// ---------- Public API (mirrors future backend endpoints) ----------

// GET /username/suggest


// GET /username/available?u=...


// POST /register


// POST /login
