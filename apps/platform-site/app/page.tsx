import type { Metadata } from 'next';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { PlatformBlockRenderer } from '@/components/platform-block-renderer';
import { fetchHomepage, fetchSiteSettings } from '@/lib/cms';
import { FALLBACK_HOMEPAGE, FALLBACK_SITE_SETTINGS } from '@/lib/fallback-content';
import { fetchPublicPlans } from '@/lib/plans';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const page = (await fetchHomepage()) ?? FALLBACK_HOMEPAGE;
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
    openGraph: {
      title: page.metaTitle ?? page.title,
      description: page.metaDescription ?? undefined,
      images: page.ogImage ? [page.ogImage] : undefined,
    },
  };
}

export default async function HomePage() {
  const [settingsRaw, pageRaw, plans] = await Promise.all([
    fetchSiteSettings(),
    fetchHomepage(),
    fetchPublicPlans(),
  ]);

  const settings =
    settingsRaw.navLinks?.length > 0 ? settingsRaw : FALLBACK_SITE_SETTINGS;
  const page = pageRaw ?? FALLBACK_HOMEPAGE;

  return (
    <>
      <SiteHeader settings={settings} />
      <main>
        {!pageRaw && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-center text-sm text-amber-900">
            CMS homepage not loaded — showing default content. Run{' '}
            <code className="rounded bg-amber-100 px-1">pnpm db:seed</code> and start
            cms-service.
          </div>
        )}
        <PlatformBlockRenderer blocks={page.blocks ?? []} plans={plans} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
