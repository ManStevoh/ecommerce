"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Button, Badge } from "@nexora/ui";
import { Sparkles } from "lucide-react";
import { fetchRecommendations } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop";

export function RecommendedProducts() {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? "";
  const addItem = useCartStore((s) => s.addItem);

  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", tenantId],
    queryFn: () => fetchRecommendations(tenantId, "homepage"),
    enabled: Boolean(tenantId),
  });

  if (!tenantId || isLoading || !data?.length) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-2xl font-semibold tracking-tight">
          Recommended for you
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <Card key={item.productId} className="overflow-hidden">
            <Link href={`/product/${item.slug}`}>
              <div
                className="aspect-square bg-cover bg-center"
                style={{ backgroundImage: `url(${PLACEHOLDER})` }}
              />
            </Link>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <Link href={`/product/${item.slug}`}>
                  <h3 className="font-medium hover:text-amber-600">
                    {item.name}
                  </h3>
                </Link>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {Math.round(item.score * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-zinc-500">{item.reason}</p>
              <p className="mt-2 font-semibold">
                {formatCurrency(item.price)}
              </p>
              <Button
                variant="outline"
                className="mt-3 w-full"
                size="sm"
                onClick={() =>
                  addItem({
                    productId: item.productId,
                    slug: item.slug,
                    name: item.name,
                    price: item.price,
                    image: PLACEHOLDER,
                  })
                }
              >
                Add to cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
