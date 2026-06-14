import { PRESET_LAYOUT_VARIANTS, resolveLayoutVariant } from './layouts';
import { getThemePreset, isThemePresetSlug } from './presets';
import type { ResolvedTheme, ThemePreset, ThemeSettingsInput } from './types';

function presetToSettings(preset: ThemePreset): ThemeSettingsInput {
  return {
    themePreset: preset.slug,
    layoutVariant: PRESET_LAYOUT_VARIANTS[preset.slug],
    primaryColor: preset.primaryColor,
    secondaryColor: preset.secondaryColor,
    accentColor: preset.accentColor,
    fontFamily: preset.fontFamily,
    darkMode: preset.darkMode,
    customColors: {
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
      surfaceColor: preset.surfaceColor,
      borderColor: preset.borderColor,
      mutedColor: preset.mutedColor,
    },
  };
}

function buildCssVars(
  preset: ThemePreset,
  overrides: ThemeSettingsInput,
): Record<string, string> {
  const primary = overrides.primaryColor ?? preset.primaryColor;
  const secondary = overrides.secondaryColor ?? preset.secondaryColor;
  const accent = overrides.accentColor ?? preset.accentColor;
  const font = overrides.fontFamily ?? preset.fontFamily;

  const customColors = overrides.customColors ?? {};
  const background = customColors.backgroundColor ?? preset.backgroundColor;
  const textColor = customColors.textColor ?? preset.textColor;
  const surface = customColors.surfaceColor ?? preset.surfaceColor;
  const border = customColors.borderColor ?? preset.borderColor;
  const muted = customColors.mutedColor ?? preset.mutedColor;

  return {
    '--tenant-primary': primary,
    '--tenant-secondary': secondary,
    '--tenant-accent': accent,
    '--font-sans': font,
    '--tenant-bg': background,
    '--tenant-surface': surface,
    '--tenant-text': textColor,
    '--tenant-muted': muted,
    '--tenant-border': border,
    '--tenant-hero-gradient': preset.heroGradient,
    '--tenant-btn-bg': preset.buttonBackground,
    '--tenant-btn-text': preset.buttonText,
    '--tenant-btn-shadow': preset.buttonShadow,
    '--tenant-radius': preset.radius,
  };
}

export function resolveTheme(settings: ThemeSettingsInput): ResolvedTheme {
  const slug =
    settings.themePreset && isThemePresetSlug(settings.themePreset)
      ? settings.themePreset
      : 'luxury';
  const preset = getThemePreset(slug) ?? getThemePreset('luxury')!;

  return {
    themePreset: preset.slug,
    layoutVariant: resolveLayoutVariant(
      preset.slug,
      settings.layoutVariant,
    ),
    primaryColor: settings.primaryColor ?? preset.primaryColor,
    secondaryColor: settings.secondaryColor ?? preset.secondaryColor,
    accentColor: settings.accentColor ?? preset.accentColor,
    fontFamily: settings.fontFamily ?? preset.fontFamily,
    logoUrl: settings.logoUrl ?? null,
    faviconUrl: settings.faviconUrl ?? null,
    darkMode: settings.darkMode ?? preset.darkMode,
    customCss: settings.customCss ?? null,
    customColors: settings.customColors ?? null,
    cssVars: buildCssVars(preset, settings),
  };
}

export function applyThemePreset(
  slug: string,
  overrides: ThemeSettingsInput = {},
): ThemeSettingsInput {
  const preset = getThemePreset(slug);
  if (!preset) {
    throw new Error(`Unknown theme preset: ${slug}`);
  }
  return {
    ...presetToSettings(preset),
    ...overrides,
    themePreset: preset.slug,
  };
}
