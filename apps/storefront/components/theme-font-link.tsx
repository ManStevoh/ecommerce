"use client";

import { googleFontsStylesheetUrl } from "@nexora/themes";
import { useThemeOverride } from "@/providers/theme-override-provider";

type Props = {
  fontFamily: string;
};

export function ThemeFontLink({ fontFamily }: Props) {
  const { resolvedTheme } = useThemeOverride();
  const activeFont = resolvedTheme?.fontFamily || fontFamily;
  const href = googleFontsStylesheetUrl(activeFont);
  if (!href) return null;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={href} />
    </>
  );
}

