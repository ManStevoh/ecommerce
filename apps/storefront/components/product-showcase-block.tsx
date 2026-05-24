'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@nexora/ui';
import { fetchProducts, getProductPrice } from '@/lib/api/catalog';
import { formatCurrency } from '@/lib/format';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';

export function ProductShowcaseBlock({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const [products, setProducts] = useState<
    Array<{ id: string; slug: string; name: string; price: number }>
  >([]);

  const title = String(config.title ?? 'Featured products');
  const productIds = (config.productIds as string[] | undefined) ?? [];

  useEffect(() => {
    if (!TENANT_ID || productIds.length === 0) return;
    void fetchProducts(TENANT_ID).then((all) => {
      const selected = all
        .filter((p) => productIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: getProductPrice(p),
        }));
      setProducts(selected);
    });
  }, [productIds.join(',')]);

  if (productIds.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
        Add product IDs to the PRODUCT_SHOWCASE block config
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h2>
      {products.length === 0 ? (
        <p className="text-sm text-zinc-500">Loading products…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="glass-card overflow-hidden">
              <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900">
                <Image
                  src={`https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80`}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {formatCurrency(product.price)}
                </p>
                <Link href={`/product/${product.slug}`} className="mt-3 inline-block">
                  <Button variant="outline" size="sm">
                    View product
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
