import { API_BASE, TENANT_ID, apiHeaders } from './client';

export type Segment = {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  rules?: Record<string, unknown>;
  createdAt: string;
};

export type SegmentEvaluation = {
  segmentId: string;
  name: string;
  memberCount: number;
  members: { email: string; orderCount: number; totalSpent: number }[];
};

export async function fetchSegments(): Promise<Segment[]> {
  if (!TENANT_ID) return [];
  const res = await fetch(`${API_BASE}/api/v1/segments`, {
    headers: apiHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createSegment(data: {
  name: string;
  description?: string;
  rules?: Record<string, unknown>;
}): Promise<Segment> {
  const res = await fetch(`${API_BASE}/api/v1/segments`, {
    method: 'POST',
    headers: apiHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create segment (${res.status})`);
  return res.json();
}

export async function evaluateSegment(id: string): Promise<SegmentEvaluation> {
  const res = await fetch(`${API_BASE}/api/v1/segments/${id}/evaluate`, {
    method: 'POST',
    headers: apiHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to evaluate segment (${res.status})`);
  return res.json();
}
