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
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlist';
import { getAccessToken } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';
import { EmptyState, LoadingBlock, PageHeader } from '@/components/page-shell';
import { ScrollAnimator } from '@/components/scroll-animator';

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
        <div className="flex min-h-[40vh] items-center justify-center">
          <Card className="max-w-md border-zinc-200/40 dark:border-zinc-800/40">
            <CardContent className="p-8">
              <EmptyState
                title="Your wishlist is empty"
                description="Browse the shop and save items you love."
                actionLabel="Browse products"
                actionHref="/"
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <ScrollAnimator key={item.productId} delay={i * 0.06}>
              <Card className="group overflow-hidden border-zinc-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800/40">
                {item.slug && (
                  <Link href={`/product/${item.slug}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image ?? PLACEHOLDER}
                        alt={item.name ?? 'Product'}
                        fill
                        className="object-cover transition-all duration-700 ease-out-expo group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute right-3 top-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90">
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-base tracking-tight">
                    {item.name ?? item.productId}
                  </CardTitle>
                  {item.price != null && (
                    <CardDescription className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(item.price)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex items-center gap-2 pt-0">
                  {item.slug ? (
                    <Link href={`/product/${item.slug}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 rounded-lg"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        View product
                      </Button>
                    </Link>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-zinc-400 hover:text-red-500"
                    onClick={() => void remove(item.productId, TENANT_ID)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </ScrollAnimator>
          ))}
        </div>
      )}
    </div>
  );
}
