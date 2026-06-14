import Link from 'next/link';
import type { PlatformSiteSettings } from '@/lib/cms';

export function SiteFooter({ settings }: { settings: PlatformSiteSettings }) {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="section-shell py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <p className="text-lg font-semibold text-slate-900">{settings.siteName}</p>
            {settings.tagline && (
              <p className="mt-2 text-sm text-slate-600">{settings.tagline}</p>
            )}
          </div>
          {settings.footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-sm font-semibold text-slate-900">{column.title}</p>
              <ul className="mt-4 space-y-2">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {settings.footerNote && (
          <p className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
            {settings.footerNote}
          </p>
        )}
      </div>
    </footer>
  );
}
