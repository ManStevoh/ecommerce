export type LayoutVariant = 'classic' | 'editorial' | 'minimal' | 'modern';

export type ThemePresetSlug =
  | 'luxury'
  | 'ocean'
  | 'forest'
  | 'midnight'
  | 'rose'
  | 'coral'
  | 'slate'
  | 'sunset'
  | 'mint'
  | 'noir'
  | 'royal';

export type ThemePreset = {
  slug: ThemePresetSlug;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  heroGradient: string;
  buttonBackground: string;
  buttonText: string;
  buttonShadow: string;
  darkMode: boolean;
  radius: string;
};

export type CustomColors = {
  themeMode?: 'light' | 'dark' | 'system';
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

export type ThemeSettingsInput = {
  themePreset?: string | null;
  layoutVariant?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  darkMode?: boolean;
  customCss?: string | null;
  customColors?: CustomColors | null;
};

export type ResolvedTheme = ThemeSettingsInput & {
  themePreset: ThemePresetSlug;
  layoutVariant: LayoutVariant;
  cssVars: Record<string, string>;
};
