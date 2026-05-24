const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type ContentBlock = {
  id: string;
  type: string;
  sortOrder: number;
  config: Record<string, unknown>;
};

export type CmsPage = {
  id: string;
  title: string;
  slug: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  blocks: ContentBlock[];
};

export async function fetchPageBySlug(
  slug: string,
  tenantId: string,
): Promise<CmsPage | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/pages/by-slug/${slug}`, {
      headers: { 'x-tenant-id': tenantId },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPublishedPageSlugs(tenantId: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/pages`, {
      headers: { 'x-tenant-id': tenantId },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const pages = (await res.json()) as Array<{ slug: string; status: string }>;
    return pages.filter((p) => p.status === 'PUBLISHED').map((p) => p.slug);
  } catch {
    return [];
  }
}
