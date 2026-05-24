import { headers } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const TENANT_SUBDOMAIN =
  process.env.NEXT_PUBLIC_TENANT_SUBDOMAIN ?? "freshfish";

export type TenantTheme = {
  themePreset?: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  darkMode: boolean;
  customCss: string | null;
};

export type TenantContext = {
  id: string;
  subdomain: string;
  displayName: string;
  theme: TenantTheme;
};

const DEFAULT_THEME: TenantTheme = {
  themePreset: 'luxury',
  primaryColor: "#0f172a",
  secondaryColor: "#64748b",
  accentColor: "#3b82f6",
  fontFamily: "Inter, sans-serif",
  logoUrl: null,
  faviconUrl: null,
  darkMode: false,
  customCss: null,
};

function resolveSubdomain(host: string): string {
  const subdomain = host.split(".")[0]?.split(":")[0] ?? "demo";
  if (subdomain === "localhost" || subdomain === "www") {
    return TENANT_SUBDOMAIN;
  }
  return subdomain;
}

export async function getTenantFromHeaders(): Promise<TenantContext> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3100";
  const subdomain = resolveSubdomain(host);

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/tenants/by-subdomain/${subdomain}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const tenant = (await res.json()) as {
        id: string;
        name: string;
        subdomain: string;
        themeSettings?: TenantTheme | null;
      };
      return {
        id: tenant.id,
        subdomain: tenant.subdomain,
        displayName: tenant.name,
        theme: tenant.themeSettings ?? DEFAULT_THEME,
      };
    }
  } catch {
    // API unavailable — fall back to derived display name
  }

  return {
    id: process.env.NEXT_PUBLIC_TENANT_ID ?? "",
    subdomain,
    displayName:
      subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/-/g, " "),
    theme: DEFAULT_THEME,
  };
}
