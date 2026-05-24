import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPageBySlug } from '@/lib/cms';
import { ContentBlockRenderer } from '@/components/content-block-renderer';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!TENANT_ID) return { title: slug };
  const page = await fetchPageBySlug(slug, TENANT_ID);
  if (!page) return { title: slug };

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

export default async function CmsPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TENANT_ID) notFound();

  const page = await fetchPageBySlug(slug, TENANT_ID);
  if (!page) notFound();

  return (
    <article>
      <ContentBlockRenderer blocks={page.blocks ?? []} />
    </article>
  );
}
