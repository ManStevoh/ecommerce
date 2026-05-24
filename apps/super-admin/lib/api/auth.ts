import { API_URL } from './client';
import { getToken } from './client';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

export async function loginAdmin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export function saveSession(accessToken: string, refreshToken: string, user?: AuthUser) {
  localStorage.setItem('nexora_access_token', accessToken);
  localStorage.setItem('nexora_refresh_token', refreshToken);
  if (user) {
    localStorage.setItem('nexora_user', JSON.stringify(user));
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('nexora_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem('nexora_access_token');
  localStorage.removeItem('nexora_refresh_token');
}

export function getAccessToken(): string {
  return getToken();
}
