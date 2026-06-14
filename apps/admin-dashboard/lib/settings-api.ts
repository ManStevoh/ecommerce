import { getAccessToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAccessToken();
  if (token) h.Authorization = `Bearer ${token}`;
  if (TENANT_ID) h['x-tenant-id'] = TENANT_ID;
  return h;
}

export type StoreSettings = {
  id: string;
  tenantId: string;
  currency: string;
  timezone: string;
  locale: string;
  taxEnabled: boolean;
  taxRate: number;
  shippingEnabled: boolean;
  contactEmail: string | null;
  supportPhone: string | null;
};

export type CustomColors = {
  backgroundColor?: string;
  textColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  mutedColor?: string;
  darkBackgroundColor?: string;
  darkTextColor?: string;
  darkSurfaceColor?: string;
  darkBorderColor?: string;
  darkMutedColor?: string;
};

export type ThemeSettings = {
  id: string;
  tenantId: string;
  themePreset: string;
  layoutVariant?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  darkMode: boolean;
  customCss: string | null;
  customColors?: CustomColors | null;
};

export type ThemePresetSummary = {
  slug: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkMode: boolean;
  defaultLayoutVariant?: string;
  backgroundColor?: string;
  textColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  mutedColor?: string;
};

export type LayoutVariantSummary = {
  slug: string;
  name: string;
  description: string;
};

export async function fetchThemePresets(): Promise<ThemePresetSummary[]> {
  const res = await fetch(`${API_BASE}/api/v1/theme-settings/presets`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchLayoutVariants(): Promise<LayoutVariantSummary[]> {
  const res = await fetch(`${API_BASE}/api/v1/theme-settings/layouts`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

export type CurrentTenant = {
  id: string;
  name: string;
  subdomain: string;
  storeSettings?: StoreSettings | null;
  themeSettings?: ThemeSettings | null;
};

export async function fetchCurrentTenant(): Promise<CurrentTenant | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(`${API_BASE}/api/v1/tenants/current`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchStoreSettings(): Promise<StoreSettings | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(`${API_BASE}/api/v1/store-settings`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateStoreSettings(
  data: Partial<
    Pick<
      StoreSettings,
      | 'currency'
      | 'timezone'
      | 'locale'
      | 'taxEnabled'
      | 'taxRate'
      | 'shippingEnabled'
      | 'contactEmail'
      | 'supportPhone'
    >
  >,
): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/api/v1/store-settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save store settings (${res.status})`);
  return res.json();
}

export async function fetchThemeSettings(): Promise<ThemeSettings | null> {
  if (!TENANT_ID) return null;
  const res = await fetch(`${API_BASE}/api/v1/theme-settings`, {
    headers: headers(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function updateThemeSettings(
  data: Partial<
    Pick<
      ThemeSettings,
      | 'themePreset'
      | 'layoutVariant'
      | 'primaryColor'
      | 'secondaryColor'
      | 'accentColor'
      | 'fontFamily'
      | 'logoUrl'
      | 'faviconUrl'
      | 'darkMode'
      | 'customCss'
      | 'customColors'
    >
  >,
): Promise<ThemeSettings> {
  const res = await fetch(`${API_BASE}/api/v1/theme-settings`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save theme settings (${res.status})`);
  return res.json();
}
