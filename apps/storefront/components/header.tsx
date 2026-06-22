"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Sparkles, Heart, User, Menu } from "lucide-react";
import { Badge } from "@nexora/ui";
import type { LayoutVariant } from "@nexora/themes";
import { AiSearchBar } from "./ai-search-bar";
import { useCartCount } from "@/store/cart";
import { useWishlistCount } from "@/store/wishlist";

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
  const wishlistCount = useWishlistCount();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const widthClass =
    variant === "minimal"
      ? "max-w-5xl"
      : variant === "editorial"
        ? "max-w-6xl"
        : variant === "modern"
          ? "max-w-[1400px]"
          : "max-w-[1600px]";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-zinc-200/60 bg-white/80 shadow-sm backdrop-blur-2xl dark:border-zinc-800/60 dark:bg-zinc-950/80"
          : "border-b border-transparent bg-white/50 backdrop-blur-xl dark:bg-zinc-950/50"
      }`}
    >
      <div
        className={`mx-auto flex ${widthClass} items-center justify-between gap-4 px-6 ${
          scrolled ? "py-2.5" : "py-3.5"
        } transition-all duration-300`}
      >
        {/* Left Side: Category Hamburger (mobile) + Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Category Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-category-sidebar"))}
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 md:hidden"
            aria-label="Open categories menu"
          >
            <Menu className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300" />
          </button>

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt=""
                className="h-8 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 transition-transform duration-300 group-hover:scale-110">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="hidden min-[390px]:inline text-lg font-bold tracking-tight">
              {tenantName}
            </span>
          </Link>
        </div>

        {/* Search (desktop/tablet) */}
        <div className="hidden flex-1 items-center gap-4 px-4 md:px-8 md:flex md:max-w-xl lg:max-w-2xl">
          <AiSearchBar />
        </div>

        {/* Desktop/Tablet Nav */}
        <nav className="hidden items-center gap-2 lg:gap-3.5 md:flex">

          {/* User Button */}
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/40 p-1.5 lg:px-3.5 lg:py-1.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Account"
          >
            <User className="h-4 w-4 text-zinc-400 group-hover:scale-110 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-all duration-300" />
            <span className="hidden lg:inline font-semibold tracking-tight">Login</span>
          </Link>

          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            className="group flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/40 p-1.5 lg:px-3.5 lg:py-1.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 transition-all duration-300 group-hover:scale-110 ${
              wishlistCount > 0 
                ? "text-red-500 fill-red-500 animate-pulse" 
                : "text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300"
            }`} />
            <span className="hidden lg:inline font-semibold tracking-tight">Favorites</span>
            {wishlistCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white shadow-sm animate-scale-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <Link
            href="/cart"
            className="group relative flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/40 p-1.5 lg:px-3.5 lg:py-1.5 text-sm font-medium text-zinc-600 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4 text-zinc-400 group-hover:scale-110 group-hover:text-zinc-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-all duration-300" />
            <span className="hidden lg:inline font-semibold tracking-tight">Cart</span>
            <span className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white shadow-sm transition-all duration-300 ${
              cartCount > 0 ? "bg-theme-accent animate-scale-in" : "bg-zinc-300 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
            }`}>
              {cartCount}
            </span>
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1.5 md:hidden">

          {/* Favorites Button */}
          <Link
            href="/wishlist"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 transition-transform duration-300 group-hover:scale-110 ${
              wishlistCount > 0 
                ? "text-red-500 fill-red-500 animate-pulse" 
                : "text-zinc-500 dark:text-zinc-400"
            }`} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm animate-scale-in">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <Link
            href="/cart"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Cart"
          >
            <ShoppingCart className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-theme-accent text-[8px] font-bold text-white shadow-sm animate-scale-in">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account Button */}
          <Link
            href="/login"
            className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            aria-label="Account"
          >
            <User className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-zinc-150 px-4 py-2.5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md md:hidden">
        <AiSearchBar />
      </div>
    </header>
  );
}
