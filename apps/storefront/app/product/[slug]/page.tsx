import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@nexora/ui';
import { ArrowLeft, ChevronRight, Shield, Truck, RotateCcw } from 'lucide-react';
import {
  fetchProductBySlug,
  fetchProductVariants,
  fetchReviews,
  getProductImage,
  getProductPrice,
} from '@/lib/api';
import { ProductPurchasePanel } from '@/components/product-purchase-panel';
import { ProductReviews } from '@/components/product-reviews';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!TENANT_ID) return { title: slug };
  const product = await fetchProductBySlug(slug, TENANT_ID);
  if (!product) return { title: slug };

  return {
    title: product.name,
    description: product.description ?? `${product.name} — shop now`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      type: 'website',
    },
  };
}

const trustItems = [
  { icon: Shield, label: 'Secure Payment' },
  { icon: Truck, label: 'Free Shipping' },
  { icon: RotateCcw, label: '30-Day Returns' },
];

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TENANT_ID) notFound();

  const product = await fetchProductBySlug(slug, TENANT_ID);
  if (!product) notFound();

  const [variants, reviewsData] = await Promise.all([
    fetchProductVariants(product.id, TENANT_ID),
    fetchReviews(product.id, TENANT_ID),
  ]);

  const price = getProductPrice(product);
  const imageUrl = getProductImage(product);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price,
      priceCurrency: product.currency ?? 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          href="/"
          className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Shop
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {product.name}
        </span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Product image */}
        <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-zinc-200/30 dark:border-zinc-800/30">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out-expo group-hover:scale-105"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Back button overlay */}
          <div className="absolute left-4 top-4">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/20 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-zinc-900/80 dark:border-zinc-700/50 dark:hover:bg-zinc-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            </Link>
          </div>

          {/* Category badge */}
          <div className="absolute right-4 top-4">
            <Badge
              variant="secondary"
              className="border-0 bg-white/90 text-zinc-800 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-200"
            >
              {product.currency}
            </Badge>
          </div>
        </div>

        {/* Product details */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description ?? 'Premium quality product.'}
          </p>

          {/* Purchase panel */}
          <div className="mt-8">
            <ProductPurchasePanel
              productId={product.id}
              slug={product.slug}
              productName={product.name}
              basePrice={price}
              currency={product.currency}
              image={imageUrl}
              variants={variants}
            />
          </div>

          {/* Trust items */}
          <div className="mt-8 flex flex-wrap gap-4 border-t border-zinc-200/60 pt-6 dark:border-zinc-800/60">
            {trustItems.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  <Icon className="h-3.5 w-3.5" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} initial={reviewsData} />
    </>
  );
}
