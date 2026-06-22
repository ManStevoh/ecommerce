export type AuthUser = {
  id: string;
  email: string;
  role: string;
  tenantId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

const TOKEN_KEY = 'nexora_access_token';
const REFRESH_KEY = 'nexora_refresh_token';
const USER_KEY = 'nexora_user';

export function getAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) ?? '';
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getTenantId(): string {
  if (typeof window === 'undefined') return '';
  const envTenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  if (envTenantId) return envTenantId;
  return getStoredUser()?.tenantId ?? '';
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem(REFRESH_KEY, session.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginStoreOwner(
  email: string,
  password: string,
  mfaCode?: string,
): Promise<AuthSession> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, ...(mfaCode ? { mfaCode } : {}) }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (body.includes('MFA code required')) {
      throw new Error('MFA_REQUIRED');
    }
    throw new Error(body || 'Invalid email or password');
  }
  const data = (await res.json()) as AuthSession;
  saveSession(data);
  return data;
}

export async function setupMfa(): Promise<{ secret: string; otpauthUrl: string }> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/v1/auth/mfa/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  if (!res.ok) throw new Error('MFA setup failed');
  return res.json();
}

export async function enableMfa(code: string): Promise<void> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/v1/auth/mfa/enable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ code }),
  });
  if (!res.ok) throw new Error('Failed to enable MFA');
}

export async function disableMfa(): Promise<void> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
  const res = await fetch(`${API_BASE}/api/v1/auth/mfa/disable`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error('Failed to disable MFA');
}
