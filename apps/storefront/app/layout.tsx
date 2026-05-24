import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TenantBranding } from "@/components/tenant-branding";
import { getTenantFromHeaders } from "@/lib/tenant";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={tenant.theme.darkMode ? "dark" : undefined}
    >
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider defaultTheme={tenant.theme.darkMode ? "dark" : "system"}>
          <QueryProvider>
            <TenantBranding theme={tenant.theme}>
              <Header tenantName={tenant.displayName} logoUrl={tenant.theme.logoUrl} />
              <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
              <Footer tenantName={tenant.displayName} />
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
