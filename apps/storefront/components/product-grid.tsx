"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, Button, Badge } from "@nexora/ui";
import { products as fallbackProducts, type Product } from "@/lib/products";
import { formatCurrency } from "@/lib/format";
import { fetchProducts as fetchApiProducts, getProductPrice } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { ShoppingBag, Eye, Menu, X } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 animate-pulse">
        {/* Skeleton Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 self-start">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-4 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-950/40 space-y-4">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-8 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </aside>

        {/* Skeleton Grid Panel */}
        <div className="flex-1 space-y-6">
          {/* Mobile filter skeleton */}
          <div className="skeleton h-12 w-full rounded-2xl md:hidden" />
          
          {/* Grid skeleton */}
          <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="skeleton aspect-[3/4] rounded-2xl" />
                <div className="skeleton h-4 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-1/3 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8">
      {/* Category Sidebar Navigation (Desktop) */}
      <aside className="hidden md:block w-56 shrink-0 self-start sticky top-24">
        <div className="rounded-2xl border border-zinc-200/60 bg-white/40 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/40">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-3">
            Categories
          </h3>
          <div className="flex flex-col gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                  activeCategory === cat
                    ? "bg-zinc-150 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <span>{cat}</span>
                {activeCategory === cat && (
                  <span className="h-1.5 w-1.5 rounded-full bg-theme-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Slide-over Drawer */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 border-r border-zinc-200/50 bg-white/95 backdrop-blur-2xl shadow-2xl p-6 transition-transform duration-300 ease-out-expo dark:border-zinc-800/50 dark:bg-zinc-950/95 flex flex-col md:hidden animate-scale-in">
            <div className="flex items-center justify-between border-b border-zinc-150 pb-4 mb-4 dark:border-zinc-800/50">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                Categories
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-between ${
                    activeCategory === cat
                      ? "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50"
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <span>{cat}</span>
                  {activeCategory === cat && (
                    <span className="h-1.5 w-1.5 rounded-full bg-theme-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Grid Content Area */}
      <div className="flex-1 space-y-6">
        {/* Mobile Header with Categories trigger button */}
        <div className="flex items-center justify-between md:hidden border border-zinc-200/60 bg-white/40 p-3 rounded-2xl dark:border-zinc-800/60 dark:bg-zinc-950/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
              aria-label="Filter Categories"
            >
              <Menu className="h-4 w-4" />
              <span>Categories</span>
            </button>
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500">
              Active: <span className="font-semibold text-theme-accent">{activeCategory}</span>
            </span>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold text-zinc-400">
            {filtered.length} Items
          </span>
        </div>

        {/* Product Grid */}
        <div className="grid gap-3 sm:gap-4 lg:gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
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
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />

                    {/* Category badge */}
                    <div className="absolute left-2 top-2">
                      <Badge
                        variant="secondary"
                        className="border-0 bg-white/90 text-zinc-800 shadow-sm backdrop-blur-sm dark:bg-zinc-900/90 dark:text-zinc-200 text-[9px] md:text-[10px] px-1.5 py-0"
                      >
                        {product.category}
                      </Badge>
                    </div>

                    {/* Hover overlay (desktop only, vertical layout stack for narrow cards) */}
                    <div className="product-card-overlay rounded-b-xl flex flex-col justify-end p-2 gap-1.5">
                      <Link
                        href={`/product/${product.slug}`}
                        className="w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="outline"
                          className="w-full border-white/30 text-white hover:bg-white/20 rounded-lg text-[10px] py-1 h-7.5"
                          size="sm"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Quick View</span>
                        </Button>
                      </Link>
                      <Button
                        className="w-full bg-white text-zinc-900 hover:bg-white/90 rounded-lg text-[10px] py-1 h-7.5"
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
                        <ShoppingBag className="h-3 w-3" />
                        <span>Add to Bag</span>
                      </Button>
                    </div>
                  </div>
                </Link>

                <CardContent className="p-2.5 sm:p-3.5">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-tight transition-colors hover:text-theme-accent line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mt-1.5 flex items-center justify-between">
                    <p className="text-xs sm:text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-150">
                      {formatCurrency(product.price)}
                    </p>
                    <button
                      type="button"
                      className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 md:hidden"
                      onClick={() =>
                        addItem({
                          productId: product.id,
                          slug: product.slug,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                      aria-label="Add to bag"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </ScrollAnimator>
          ))}
        </div>
      </div>
    </div>
  );
}
