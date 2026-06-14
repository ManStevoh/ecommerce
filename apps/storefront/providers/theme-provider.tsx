"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  forcedTheme,
}: {
  children: React.ReactNode;
  defaultTheme?: string;
  forcedTheme?: string;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={defaultTheme === "system"}
      forcedTheme={forcedTheme}
    >
      {children}
    </NextThemesProvider>
  );
}
