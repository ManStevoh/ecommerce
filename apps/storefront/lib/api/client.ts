export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function tenantHeaders(tenantId: string): Record<string, string> {
  return { 'x-tenant-id': tenantId };
}

export function authHeaders(tenantId: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...tenantHeaders(tenantId),
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nexora_access_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { tenantId?: string },
): Promise<T> {
  const headers = {
    ...(init?.tenantId ? tenantHeaders(init.tenantId) : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `Request failed (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}
