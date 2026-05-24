export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('nexora_access_token') ?? '';
}

export function authHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${getToken()}`,
    'Content-Type': 'application/json',
  };
}
