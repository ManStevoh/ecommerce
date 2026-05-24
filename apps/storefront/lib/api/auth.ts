import { API_URL } from './client';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  firstName?: string | null;
  lastName?: string | null;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export async function loginCustomer(
  email: string,
  password: string,
  tenantId: string,
): Promise<AuthSession> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-tenant-id': tenantId },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Login failed',
    );
  }
  return res.json() as Promise<AuthSession>;
}

export async function registerStore(data: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  storeName: string;
}) {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Registration failed',
    );
  }
  return res.json();
}

export async function getGoogleAuthUrl(): Promise<{ url: string; state: string }> {
  const res = await fetch(`${API_URL}/api/v1/auth/oauth/google`);
  if (!res.ok) throw new Error('Google sign-in is not available');
  return res.json() as Promise<{ url: string; state: string }>;
}

export async function completeGoogleOAuth(
  code: string,
  state: string,
  tenantId: string,
): Promise<AuthSession> {
  const params = new URLSearchParams({ code, state });
  const res = await fetch(
    `${API_URL}/api/v1/auth/oauth/google/callback?${params.toString()}`,
    { headers: { 'x-tenant-id': tenantId } },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? 'Google sign-in failed',
    );
  }
  return res.json() as Promise<AuthSession>;
}
