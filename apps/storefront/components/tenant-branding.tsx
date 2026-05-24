"use client";

import { resolveTheme, type ThemeSettingsInput } from "@nexora/themes";
import type { TenantTheme } from "@/lib/tenant";

type Props = {
  theme: TenantTheme;
  children: React.ReactNode;
};

export function TenantBranding({ theme, children }: Props) {
  const resolved = resolveTheme(theme as ThemeSettingsInput);

  return (
    <>
      {theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      ) : null}
      <div
        data-theme={resolved.themePreset}
        style={resolved.cssVars as React.CSSProperties}
        className="tenant-branded min-h-full"
      >
        {children}
      </div>
    </>
  );
}
