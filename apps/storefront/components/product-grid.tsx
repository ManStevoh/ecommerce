"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Button, Badge } from "@nexora/ui";
import { products as fallbackProducts, type Product } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import { fetchProducts as fetchApiProducts, getProductPrice } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { ShoppingBag, Eye } from "lucide-react";
import { ScrollAnimator } from "./scroll-animator";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=800&fit=crop";

async function fetchProducts(): Promise<Product[]> {
  const api = await fetchApiProducts(process.env.NEXT_PUBLIC_TENANT_ID);
  if (api.length > 0) {
    return api.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description ?? "",
      price: getProductPrice(p),
      image: PLACEHOLDER_IMAGE,
      category: p.currency,
    }));
  }
  return fallbackProducts;
}

export function ProductGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
  const addItem = useCartStore((s) => s.addItem);
  const [activeCategory, setActiveCategory] = useState("All");

  // Extract unique categories
  const categories = useMemo(() => {
    if (!data) return ["All"];
    const cats = Array.from(new Set(data.map((p) => p.category)));
    return ["All", ...cats];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (activeCategory === "All") return data;
    return data.filter((p) => p.category === activeCategory);
  }, [data, activeCategory]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Skeleton filter pills */}
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-9 w-20 rounded-full"
            />
          ))}
        </div>
        {/* Skeleton grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[3/4] rounded-2xl" />
              <div className="skeleton h-4 w-3/4 rounded-lg" />
              <div className="skeleton h-4 w-1/3 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`filter-pill ${
              activeCategory === cat ? "filter-pill-active" : ""
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product, i) => (
          <ScrollAnimator key={product.id} delay={i * 0.06}>
            <Card className="group relative overflow-hidden border-zinc-200/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:border-zinc-800/40">
              <Link href={`/product/${product.slug}`}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-all duration-700 ease-out-expo group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />

                  {/* Category badge */}
                  <div className="absolute left-3 top-3">
                    <Badge
                      variant="secondary"
                      className="border-0 bg-white/90 text-zinc-800 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-200"
                    >
                      {product.category}
                    </Badge>
                  </div>

                  {/* Hover overlay */}
                  <div className="product-card-overlay rounded-b-xl">
                    <div className="flex w-full gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          className="w-full border-white/30 text-white hover:bg-white/20 rounded-lg text-xs"
                          size="sm"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Quick View
                        </Button>
                      </Link>
                      <Button
                        className="flex-1 bg-white text-zinc-900 hover:bg-white/90 rounded-lg text-xs"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            productId: product.id,
                            slug: product.slug,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          });
                        }}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </Link>

              <CardContent className="p-4">
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-medium tracking-tight transition-colors hover:text-theme-accent">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-lg font-semibold">
                    {formatCurrency(product.price)}
                  </p>
                  <button
                    type="button"
                    className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 lg:hidden"
                    onClick={() =>
                      addItem({
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                      })
                    }
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimator>
        ))}
      </div>
    </div>
  );
}
