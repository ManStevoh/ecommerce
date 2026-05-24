"use client";

import type { TenantTheme } from "@/lib/tenant";

type Props = {
  theme: TenantTheme;
  children: React.ReactNode;
};

export function TenantBranding({ theme, children }: Props) {
  const cssVars = {
    "--tenant-primary": theme.primaryColor,
    "--tenant-secondary": theme.secondaryColor,
    "--tenant-accent": theme.accentColor,
    "--font-sans": theme.fontFamily,
  } as React.CSSProperties;

  return (
    <>
      {theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      ) : null}
      <div style={cssVars} className="tenant-branded min-h-full">
        {children}
      </div>
    </>
  );
}
