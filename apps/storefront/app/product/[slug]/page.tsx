import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@nexora/ui';
import { ArrowLeft } from 'lucide-react';
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
      <div className="grid gap-12 lg:grid-cols-2">
        <div
          className="relative aspect-[3/4] overflow-hidden rounded-3xl glass-card bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        <div className="flex flex-col justify-center">
          <Link href="/" className="mb-6 inline-block">
            <Button variant="ghost" className="w-fit">
              <ArrowLeft className="h-4 w-4" />
              Back to shop
            </Button>
          </Link>
          <Badge variant="secondary" className="mb-4 w-fit">
            {product.currency}
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {product.name}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-theme-muted">
            {product.description ?? 'Premium quality product.'}
          </p>
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
        </div>
      </div>
      <ProductReviews productId={product.id} initial={reviewsData} />
    </>
  );
}
