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
import { ShoppingCart, Eye, Menu, X, Heart } from "lucide-react";
import { ScrollAnimator } from "./scroll-animator";
import type { LayoutVariant } from "@nexora/themes";

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

import { useThemeOverride } from "@/providers/theme-override-provider";

export function ProductGrid({
  layoutVariant: serverLayoutVariant = "classic",
}: {
  layoutVariant?: LayoutVariant;
}) {
  const { layoutVariant: overrideLayoutVariant } = useThemeOverride();
  const layoutVariant = overrideLayoutVariant || serverLayoutVariant;

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

  // Listen to mobile menu trigger from header
  useEffect(() => {
    const handleOpen = () => setIsSidebarOpen(true);
    window.addEventListener("open-category-sidebar", handleOpen);
    return () => window.removeEventListener("open-category-sidebar", handleOpen);
  }, []);

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

  if (layoutVariant === "minimal") {
    return (
      <div className="space-y-12">
        {/* Horizontal Category Navigation Bar */}
        <div className="relative border-b border-zinc-200/50 pb-4 dark:border-zinc-800/50">
          <div className="flex overflow-x-auto scrollbar-none gap-2 py-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg border px-5 py-2 text-xs font-bold transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500">
              Category: <span className="font-bold text-emerald-600">{activeCategory}</span>
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              {filtered.length} Items
            </span>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product, i) => {
              const originalPrice = product.price * 1.25;

              return (
                <ScrollAnimator key={product.id} delay={i * 0.05}>
                  <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-lg border border-zinc-100 dark:border-zinc-900 overflow-hidden transition-all duration-300 group flex flex-col h-full hover:shadow-xl">
                    <Link href={`/product/${product.slug}`} className="relative block bg-zinc-50 dark:bg-zinc-900 p-4">
                      <div className="h-48 relative overflow-hidden flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          Organic
                        </Badge>
                      </div>
                    </Link>

                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors text-base line-clamp-1">
                          <Link href={`/product/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {product.description || "Fresh natural ingredients grown locally and sourced with care for your family's table."}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-auto border-t border-zinc-100 dark:border-zinc-800 pt-3.5 gap-1">
                        <div className="flex flex-wrap gap-1.5 items-baseline">
                          <span className="font-extrabold text-emerald-600 text-base sm:text-lg">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-xs text-zinc-400 line-through">
                            {formatCurrency(originalPrice)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 hover:text-rose-500 dark:text-zinc-400 rounded-full border border-zinc-200/60 dark:border-zinc-800 transition-all duration-200"
                            aria-label="Add to wishlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          
                          <button
                            type="button"
                            className="h-9 w-9 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-all duration-200 shadow-sm hover:shadow"
                            onClick={() =>
                              addItem({
                                productId: product.id,
                                slug: product.slug,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                              })
                            }
                            aria-label="Add to cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollAnimator>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (layoutVariant === "modern") {
    return (
      <div className="space-y-12">
        {/* Horizontal Category Navigation Bar */}
        <div className="relative border-b border-zinc-200/50 pb-4 dark:border-zinc-800/50">
          <div className="flex overflow-x-auto scrollbar-none gap-2 py-1 px-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Modern Borderless Grid Content Area */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
              Showing: <span className="font-bold text-zinc-950 dark:text-white">{activeCategory}</span>
            </span>
            <span className="text-xs font-medium text-zinc-400 tracking-wider">
              {filtered.length} Items Available
            </span>
          </div>

          <div className="grid gap-8 sm:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product, i) => (
              <ScrollAnimator key={product.id} delay={i * 0.05}>
                <div className="group relative flex flex-col bg-transparent border-0 shadow-none">
                  {/* Image container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                    <Link href={`/product/${product.slug}`}>
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </Link>

                    {/* Quick Add Button on Image Hover */}
                    <div className="absolute bottom-4 right-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <Button
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
                        className="h-10 w-10 rounded-full bg-white text-zinc-900 shadow-xl hover:bg-zinc-50 hover:scale-110 active:scale-95 transition-all p-0 flex items-center justify-center"
                        aria-label="Add to cart"
                      >
                        <ShoppingCart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="absolute left-4 top-4">
                      <Badge className="bg-zinc-900/80 text-white backdrop-blur-md border-0 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Text Details underneath (Borderless style) */}
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="font-serif text-lg font-bold tracking-tight text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300 line-clamp-1 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-zinc-500 line-clamp-1 dark:text-zinc-400">
                        {product.description || "Premium curated selection"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-sans text-base font-black tracking-tight text-zinc-950 dark:text-white">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollAnimator>
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
        {/* Mobile Header (minimal indicator) */}
        <div className="flex items-center justify-between md:hidden border-b border-zinc-200/60 pb-2.5 dark:border-zinc-800/60">
          <span className="text-xs font-semibold text-zinc-500">
            Category: <span className="font-bold text-theme-accent">{activeCategory}</span>
          </span>
          <span className="text-xs font-semibold text-zinc-400">
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
                        <ShoppingCart className="h-3 w-3" />
                        <span>Add to Cart</span>
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
                      aria-label="Add to cart"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
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
