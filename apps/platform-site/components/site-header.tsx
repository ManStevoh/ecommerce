import Link from 'next/link';
import type { PlatformSiteSettings } from '@/lib/cms';

const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3200';

export function SiteHeader({ settings }: { settings: PlatformSiteSettings }) {
  const ctaHref = settings.primaryCtaHref ?? `${ADMIN_URL}/login`;
  const ctaLabel = settings.primaryCtaLabel ?? 'Get started';

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="section-shell flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logoUrl} alt={settings.siteName} className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              {settings.siteName}
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {settings.navLinks.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={`${ADMIN_URL}/login`}
            className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:inline"
          >
            Sign in
          </Link>
          <Link
            href={ctaHref}
            className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
