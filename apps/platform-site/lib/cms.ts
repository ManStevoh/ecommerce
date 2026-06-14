const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type PlatformContentBlock = {
  id: string;
  type: string;
  sortOrder: number;
  config: Record<string, unknown>;
};

export type PlatformPage = {
  id: string;
  title: string;
  slug: string;
  isHomepage: boolean;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  blocks: PlatformContentBlock[];
};

export type NavLink = { label: string; href: string };

export type FooterColumn = {
  title: string;
  links: NavLink[];
};

export type PlatformSiteSettings = {
  siteName: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaHref?: string | null;
  navLinks: NavLink[];
  footerColumns: FooterColumn[];
  footerNote?: string | null;
};

export async function fetchHomepage(): Promise<PlatformPage | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/platform/pages/public/home`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchPlatformPageBySlug(
  slug: string,
): Promise<PlatformPage | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/platform/pages/public/by-slug/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchSiteSettings(): Promise<PlatformSiteSettings> {
  const fallback: PlatformSiteSettings = {
    siteName: 'Nexora',
    tagline: 'Commerce platform for modern brands',
    navLinks: [],
    footerColumns: [],
  };

  try {
    const res = await fetch(`${API_BASE}/api/v1/platform/site/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return {
      ...fallback,
      ...data,
      navLinks: (data.navLinks as NavLink[]) ?? [],
      footerColumns: (data.footerColumns as FooterColumn[]) ?? [],
    };
  } catch {
    return fallback;
  }
}
