import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@nexora/ui';
import { ArrowLeft } from 'lucide-react';
import { fetchProductBySlug, fetchReviews, getProductPrice } from '@/lib/api';
import { AddToCartButton } from '@/components/add-to-cart-button';
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

  const price = getProductPrice(product);
  const reviewsData = await fetchReviews(product.id, TENANT_ID);
  const images = (product as { images?: unknown }).images;
  const imageUrl =
    Array.isArray(images) && images.length > 0
      ? String(images[0])
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=800&fit=crop';

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
          <p className="mt-4 text-2xl font-light text-amber-600 dark:text-amber-400">
            {product.currency} {price.toLocaleString()}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            {product.description ?? 'Premium quality product.'}
          </p>
          <div className="mt-8">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price,
                image: imageUrl,
              }}
            />
          </div>
        </div>
      </div>
      <ProductReviews productId={product.id} initial={reviewsData} />
    </>
  );
}
