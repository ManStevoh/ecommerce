import { getAccessToken } from '../auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (TENANT_ID) headers['x-tenant-id'] = TENANT_ID;
  return headers;
}

export function parseAmount(value: number | string): number {
  return typeof value === 'string' ? parseFloat(value) : value;
}

export type ApiOrder = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  totalAmount: number | string;
  status: string;
  createdAt: string;
};

export type ApiProduct = {
  id: string;
  name: string;
  price: number | string;
  stockQuantity?: number;
  isActive: boolean;
};
