import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { resolveTheme } from "@nexora/themes";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TenantBranding } from "@/components/tenant-branding";
import { ThemeFontLink } from "@/components/theme-font-link";
import { LayoutShell } from "@/components/layouts/layout-shell";
import { getTenantFromHeaders } from "@/lib/tenant";

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantFromHeaders();
  return {
    title: tenant.displayName,
    description: `${tenant.displayName} — powered by Nexora Commerce`,
    icons: tenant.theme.faviconUrl ? { icon: tenant.theme.faviconUrl } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromHeaders();
  const resolved = resolveTheme(tenant.theme);

  const htmlClass = undefined;
  const forcedTheme = "light";
  const defaultTheme = "light";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={htmlClass}
    >
      <head>
        <ThemeFontLink fontFamily={tenant.theme.fontFamily} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme={defaultTheme} forcedTheme={forcedTheme}>
          <QueryProvider>
            <TenantBranding theme={tenant.theme}>
              <LayoutShell
                layoutVariant={resolved.layoutVariant}
                tenantName={tenant.displayName}
                logoUrl={tenant.theme.logoUrl}
              >
                {children}
              </LayoutShell>
            </TenantBranding>
          </QueryProvider>
        </ThemeProvider>
        <Script id="nexora-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/sw.js').catch(function () {});
            });
          }
        `}</Script>
      </body>
    </html>
  );
}
