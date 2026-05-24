"use client";

import Link from "next/link";
import { ShoppingBag, Sparkles } from "lucide-react";
import { Badge } from "@nexora/ui";
import type { LayoutVariant } from "@nexora/themes";
import { ThemeToggle } from "./theme-toggle";
import { AiSearchBar } from "./ai-search-bar";
import { MobileNav } from "./mobile-nav";
import { useCartCount } from "@/store/cart";

export function Header({
  tenantName,
  logoUrl,
  variant = "classic",
}: {
  tenantName: string;
  logoUrl?: string | null;
  variant?: LayoutVariant;
}) {
  const cartCount = useCartCount();
  const widthClass =
    variant === "minimal"
      ? "max-w-5xl"
      : variant === "editorial"
        ? "max-w-6xl"
        : "max-w-7xl";
  const paddingClass = variant === "minimal" ? "py-2" : "py-4";

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/50 bg-white/70 backdrop-blur-2xl dark:border-zinc-800/50 dark:bg-zinc-950/70">
      <div className={`mx-auto flex ${widthClass} flex-col gap-4 px-6 ${paddingClass} lg:flex-row lg:items-center lg:justify-between`}>
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-8 w-auto object-contain" />
            ) : (
              <Sparkles className="h-5 w-5 text-amber-500" />
            )}
            <span className="text-lg font-semibold tracking-tight">
              {tenantName}
            </span>
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <MobileNav />
            <Link
              href="/cart"
              className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 lg:max-w-xl">
          <AiSearchBar />
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Shop
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Open a store
          </Link>
          <Link
            href="/support"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Support
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Account
          </Link>
          <Link
            href="/wishlist"
            className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            Wishlist
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Cart
            {cartCount > 0 && (
              <Badge variant="warning">{cartCount}</Badge>
            )}
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
