import { API_URL, authHeaders } from './client';

export type PlatformBlock = {
  type: string;
  sortOrder?: number;
  config?: Record<string, unknown>;
};

export type PlatformPage = {
  id: string;
  title: string;
  slug: string;
  isHomepage: boolean;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  blocks: Array<{
    id: string;
    type: string;
    sortOrder: number;
    config: Record<string, unknown>;
  }>;
};

export type PlatformSiteSettings = {
  siteName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  navLinks: Array<{ label: string; href: string }>;
  footerColumns: Array<{
    title: string;
    links: Array<{ label: string; href: string }>;
  }>;
  footerNote?: string | null;
};

export async function fetchPlatformPages(): Promise<PlatformPage[]> {
  const res = await fetch(`${API_URL}/api/v1/platform/pages`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to load pages (${res.status})`);
  return res.json();
}

export async function fetchPlatformPage(id: string): Promise<PlatformPage> {
  const res = await fetch(`${API_URL}/api/v1/platform/pages/${id}`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to load page (${res.status})`);
  return res.json();
}

export async function createPlatformPage(data: {
  title: string;
  slug: string;
  isHomepage?: boolean;
  blocks?: PlatformBlock[];
}): Promise<PlatformPage> {
  const res = await fetch(`${API_URL}/api/v1/platform/pages`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ ...data, status: 'DRAFT' }),
  });
  if (!res.ok) throw new Error(`Failed to create page (${res.status})`);
  return res.json();
}

export async function updatePlatformPage(
  id: string,
  data: Partial<{
    title: string;
    slug: string;
    metaTitle: string;
    metaDescription: string;
    isHomepage: boolean;
  }>,
): Promise<PlatformPage> {
  const res = await fetch(`${API_URL}/api/v1/platform/pages/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update page (${res.status})`);
  return res.json();
}

export async function updatePlatformPageBlocks(
  id: string,
  blocks: PlatformBlock[],
): Promise<PlatformPage> {
  const res = await fetch(`${API_URL}/api/v1/platform/pages/${id}/blocks`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ blocks }),
  });
  if (!res.ok) throw new Error(`Failed to update blocks (${res.status})`);
  return res.json();
}

export async function publishPlatformPage(id: string): Promise<PlatformPage> {
  const res = await fetch(`${API_URL}/api/v1/platform/pages/${id}/publish`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to publish (${res.status})`);
  return res.json();
}

export async function fetchPlatformSiteSettings(): Promise<PlatformSiteSettings> {
  const res = await fetch(`${API_URL}/api/v1/platform/site`, {
    headers: authHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to load site settings (${res.status})`);
  const data = await res.json();
  return {
    ...data,
    navLinks: data.navLinks ?? [],
    footerColumns: data.footerColumns ?? [],
  };
}

export async function updatePlatformSiteSettings(
  data: Partial<PlatformSiteSettings>,
): Promise<PlatformSiteSettings> {
  const res = await fetch(`${API_URL}/api/v1/platform/site`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update site settings (${res.status})`);
  return res.json();
}
