import { API_BASE, TENANT_ID, apiHeaders } from './client';
import { getAccessToken } from '../auth';

export type MediaAsset = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string | null;
  createdAt: string;
};

export async function fetchMedia(): Promise<MediaAsset[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(`${API_BASE}/api/v1/media`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createMedia(data: {
  filename: string;
  url: string;
  mimeType?: string;
  sizeBytes?: number;
  altText?: string;
}): Promise<MediaAsset> {
  const res = await fetch(`${API_BASE}/api/v1/media`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify({
      mimeType: data.mimeType ?? 'image/jpeg',
      sizeBytes: data.sizeBytes ?? 0,
      ...data,
    }),
  });
  if (!res.ok) throw new Error(`Failed to create media (${res.status})`);
  return res.json();
}

export async function uploadMedia(file: File): Promise<MediaAsset> {
  const form = new FormData();
  form.append('file', file);
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (TENANT_ID) headers['x-tenant-id'] = TENANT_ID;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api/v1/media/upload`, {
    method: 'POST',
    headers,
    body: form,
  });
  if (!res.ok) throw new Error(`Failed to upload media (${res.status})`);
  return res.json();
}
