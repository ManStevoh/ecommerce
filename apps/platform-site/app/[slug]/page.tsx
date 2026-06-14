import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { PlatformBlockRenderer } from '@/components/platform-block-renderer';
import {
  fetchPlatformPageBySlug,
  fetchSiteSettings,
} from '@/lib/cms';
import { fetchPublicPlans } from '@/lib/plans';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchPlatformPageBySlug(slug);
  if (!page) return { title: slug };

  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  };
}

export default async function PlatformPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [settings, page, plans] = await Promise.all([
    fetchSiteSettings(),
    fetchPlatformPageBySlug(slug),
    fetchPublicPlans(),
  ]);

  if (!page) notFound();

  return (
    <>
      <SiteHeader settings={settings} />
      <main>
        <PlatformBlockRenderer blocks={page.blocks ?? []} plans={plans} />
      </main>
      <SiteFooter settings={settings} />
    </>
  );
}
