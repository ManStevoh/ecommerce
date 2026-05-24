'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@nexora/ui';
import { useWishlistStore } from '@/store/wishlist';
import { getAccessToken } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';
import { EmptyState, LoadingBlock, PageHeader } from '@/components/page-shell';

const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? '';
const PLACEHOLDER =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=crop';

export default function WishlistPage() {
  const router = useRouter();
  const items = useWishlistStore((s) => s.items);
  const [loading, setLoading] = useState(true);
  const remove = useWishlistStore((s) => s.remove);
  const syncFromApi = useWishlistStore((s) => s.syncFromApi);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace('/login');
      return;
    }
    if (TENANT_ID) {
      void syncFromApi(TENANT_ID).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [router, syncFromApi]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Wishlist"
        description="Products you have saved for later"
      />

      {loading ? (
        <LoadingBlock rows={4} />
      ) : !items.length ? (
        <Card className="glass-card">
          <CardContent>
            <EmptyState
              title="Your wishlist is empty"
              description="Browse the shop and save items you love."
              actionLabel="Browse products"
              actionHref="/"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              {item.slug && (
                <Link href={`/product/${item.slug}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image ?? PLACEHOLDER}
                      alt={item.name ?? 'Product'}
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </Link>
              )}
              <CardHeader>
                <CardTitle className="text-base">
                  {item.name ?? item.productId}
                </CardTitle>
                {item.price != null && (
                  <CardDescription>
                    {formatCurrency(item.price)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                {item.slug ? (
                  <Link
                    href={`/product/${item.slug}`}
                    className="text-sm text-amber-600 hover:underline"
                  >
                    View product
                  </Link>
                ) : (
                  <span />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void remove(item.productId, TENANT_ID)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
