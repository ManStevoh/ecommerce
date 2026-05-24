import type { ContentBlock } from '@/lib/cms';
import { Button } from '@nexora/ui';
import Link from 'next/link';
import { ProductShowcaseBlock } from './product-showcase-block';

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-12">
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  const c = block.config;

  switch (block.type) {
    case 'HERO':
      return (
        <section className="rounded-3xl glass-card px-8 py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {String(c.headline ?? 'Welcome')}
          </h1>
          {c.subheadline != null && c.subheadline !== '' && (
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-500">
              {String(c.subheadline)}
            </p>
          )}
          {c.ctaLabel != null && c.ctaHref != null && (
            <Link href={String(c.ctaHref)} className="mt-8 inline-block">
              <Button variant="luxury">{String(c.ctaLabel)}</Button>
            </Link>
          )}
        </section>
      );
    case 'CTA':
      return (
        <section className="rounded-2xl bg-zinc-900 px-8 py-12 text-center text-white dark:bg-zinc-800">
          <h2 className="text-2xl font-semibold">{String(c.title ?? 'Shop now')}</h2>
          {c.subtitle != null && c.subtitle !== '' ? (
            <p className="mt-2 text-zinc-300">{String(c.subtitle)}</p>
          ) : null}
          <Link href={String(c.href ?? '/')} className="mt-6 inline-block">
            <Button variant="luxury">{String(c.button ?? 'Browse')}</Button>
          </Link>
        </section>
      );
    case 'FAQ':
      return (
        <section>
          <h2 className="mb-6 text-2xl font-semibold">{String(c.title ?? 'FAQ')}</h2>
          <div className="space-y-4">
            {((c.items as Array<{ q: string; a: string }>) ?? []).map((item, i) => (
              <details key={i} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <summary className="cursor-pointer font-medium">{item.q}</summary>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      );
    case 'RICH_TEXT':
      return (
        <section className="prose dark:prose-invert max-w-none">
          <p>{String(c.body ?? '')}</p>
        </section>
      );
    case 'PRODUCT_SHOWCASE':
      return <ProductShowcaseBlock config={c} />;
    case 'NEWSLETTER':
      return (
        <section className="rounded-2xl glass-card px-8 py-10 text-center">
          <h2 className="text-2xl font-semibold">{String(c.title ?? 'Stay in touch')}</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {String(c.subtitle ?? 'Get updates on new arrivals and offers.')}
          </p>
          <Link href="/support" className="mt-6 inline-block">
            <Button variant="luxury">{String(c.button ?? 'Contact us')}</Button>
          </Link>
        </section>
      );
    default:
      return (
        <section className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          Block: {block.type}
        </section>
      );
  }
}
