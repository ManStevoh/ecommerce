"use client";

import { resolveTheme, type ThemeSettingsInput } from "@nexora/themes";
import type { TenantTheme } from "@/lib/tenant";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type Props = {
  theme: TenantTheme;
  children: React.ReactNode;
};

export function TenantBranding({ theme, children }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = resolveTheme(theme as ThemeSettingsInput);
  const isDark = resolvedTheme === "dark" || (!mounted && theme.darkMode);

  const cssVars = { ...resolved.cssVars };

  if (isDark) {
    cssVars["--tenant-bg"] = "#09090b"; // Tailwind zinc-950
    cssVars["--tenant-text"] = "#fafafa"; // Tailwind zinc-50
    cssVars["--tenant-surface"] = "rgba(18, 18, 22, 0.72)"; // Premium glassy dark surface
    cssVars["--tenant-muted"] = "#a1a1aa"; // Tailwind zinc-400
    cssVars["--tenant-border"] = "rgba(255, 255, 255, 0.08)"; // Subtle dark border
    cssVars["--tenant-hero-gradient"] = `linear-gradient(135deg, ${resolved.accentColor}1c 0%, transparent 60%, rgba(9, 9, 11, 0.8) 100%)`;
  }

  return (
    <>
      {theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      ) : null}
      <div
        data-theme={resolved.themePreset}
        style={cssVars as React.CSSProperties}
        className="tenant-branded min-h-full"
      >
        {children}
      </div>
    </>
  );
}
