"use client";

import { useRef } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Button, Badge } from "@nexora/ui";
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { fetchRecommendations } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { ScrollAnimator } from "./scroll-animator";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop";

export function RecommendedProducts() {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID ?? "";
  const addItem = useCartStore((s) => s.addItem);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["recommendations", tenantId],
    queryFn: () => fetchRecommendations(tenantId, "homepage"),
    enabled: Boolean(tenantId),
  });

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!tenantId || isLoading || !data?.length) {
    return null;
  }

  return (
    <ScrollAnimator>
      <section className="space-y-6">
        {/* Section header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                Recommended for you
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Personalized picks based on your taste
              </p>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              className="rounded-full border border-zinc-200 p-2 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="rounded-full border border-zinc-200 p-2 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll carousel */}
        <div
          ref={scrollRef}
          className="scroll-snap-x -mx-2 px-2 pb-4"
        >
          {data.map((item) => (
            <Card
              key={item.productId}
              className="scroll-snap-item group w-[280px] shrink-0 overflow-hidden border-zinc-200/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800/40"
            >
              <Link href={`/product/${item.slug}`}>
                <div
                  className="aspect-square bg-cover bg-center transition-transform duration-700 ease-out-expo group-hover:scale-105"
                  style={{ backgroundImage: `url(${PLACEHOLDER})` }}
                />
              </Link>
              <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <Link href={`/product/${item.slug}`}>
                    <h3 className="font-medium tracking-tight transition-colors hover:text-theme-accent">
                      {item.name}
                    </h3>
                  </Link>
                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 text-xs dark:bg-emerald-900/30 dark:text-emerald-400"
                  >
                    {Math.round(item.score * 100)}% match
                  </Badge>
                </div>
                <p className="line-clamp-1 text-sm text-zinc-500">
                  {item.reason}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-semibold">
                    {formatCurrency(item.price)}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
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
                    <ShoppingBag className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </ScrollAnimator>
  );
}
