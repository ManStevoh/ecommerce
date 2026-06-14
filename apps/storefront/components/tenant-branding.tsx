import { resolveTheme, type ThemeSettingsInput } from "@nexora/themes";
import type { TenantTheme } from "@/lib/tenant";

type Props = {
  theme: TenantTheme;
  children: React.ReactNode;
};

export function TenantBranding({ theme, children }: Props) {
  const resolved = resolveTheme(theme as ThemeSettingsInput);
  
  const cc = theme.customColors ?? {};
  const darkBg = cc.darkBackgroundColor ?? "#09090b";
  const darkText = cc.darkTextColor ?? "#fafafa";
  const darkSurface = cc.darkSurfaceColor ?? "rgba(18, 18, 22, 0.72)";
  const darkMuted = cc.darkMutedColor ?? "#a1a1aa";
  const darkBorder = cc.darkBorderColor ?? "rgba(255, 255, 255, 0.08)";
  const darkHeroGrad = `linear-gradient(135deg, ${resolved.accentColor}1c 0%, transparent 60%, rgba(9, 9, 11, 0.8) 100%)`;

  const cssRules = `
    .tenant-branded {
      --tenant-primary: ${resolved.cssVars["--tenant-primary"]};
      --tenant-secondary: ${resolved.cssVars["--tenant-secondary"]};
      --tenant-accent: ${resolved.cssVars["--tenant-accent"]};
      --font-sans: ${resolved.cssVars["--font-sans"]};
      --tenant-bg: ${resolved.cssVars["--tenant-bg"]};
      --tenant-surface: ${resolved.cssVars["--tenant-surface"]};
      --tenant-text: ${resolved.cssVars["--tenant-text"]};
      --tenant-muted: ${resolved.cssVars["--tenant-muted"]};
      --tenant-border: ${resolved.cssVars["--tenant-border"]};
      --tenant-hero-gradient: ${resolved.cssVars["--tenant-hero-gradient"]};
      --tenant-btn-bg: ${resolved.cssVars["--tenant-btn-bg"]};
      --tenant-btn-text: ${resolved.cssVars["--tenant-btn-text"]};
      --tenant-btn-shadow: ${resolved.cssVars["--tenant-btn-shadow"]};
      --tenant-radius: ${resolved.cssVars["--tenant-radius"]};
    }

    .dark .tenant-branded {
      --tenant-bg: ${darkBg};
      --tenant-text: ${darkText};
      --tenant-surface: ${darkSurface};
      --tenant-muted: ${darkMuted};
      --tenant-border: ${darkBorder};
      --tenant-hero-gradient: ${darkHeroGrad};
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssRules }} />
      {theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      ) : null}
      <div
        data-theme={resolved.themePreset}
        className="tenant-branded min-h-full"
      >
        {children}
      </div>
    </>
  );
}
