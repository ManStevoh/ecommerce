import type { LayoutVariant, ThemePresetSlug } from './types';

export const LAYOUT_VARIANTS: {
  slug: LayoutVariant;
  name: string;
  description: string;
}[] = [
  {
    slug: 'classic',
    name: 'Classic',
    description: 'Centered content with glass hero card — the default Nexora shell.',
  },
  {
    slug: 'editorial',
    name: 'Editorial',
    description: 'Split hero with wider typography and magazine-style spacing.',
  },
  {
    slug: 'minimal',
    name: 'Minimal',
    description: 'Compact header and centered, low-profile hero.',
  },
  {
    slug: 'modern',
    name: 'Modern Gallery',
    description: 'Minimalist borderless grid with horizontal top navigation and elegant visual presentation.',
  },
];

export const PRESET_LAYOUT_VARIANTS: Record<ThemePresetSlug, LayoutVariant> = {
  luxury: 'classic',
  ocean: 'editorial',
  forest: 'editorial',
  midnight: 'minimal',
  rose: 'classic',
  coral: 'classic',
  slate: 'minimal',
  sunset: 'editorial',
  mint: 'editorial',
  noir: 'minimal',
  royal: 'classic',
};

export function isLayoutVariant(value: string): value is LayoutVariant {
  return value === 'classic' || value === 'editorial' || value === 'minimal' || value === 'modern';
}

export function resolveLayoutVariant(
  presetSlug: ThemePresetSlug,
  override?: string | null,
): LayoutVariant {
  if (override && isLayoutVariant(override)) {
    return override;
  }
  return PRESET_LAYOUT_VARIANTS[presetSlug] ?? 'classic';
}
