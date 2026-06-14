"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Sparkles, Heart, User } from "lucide-react";
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
        : "max-w-7xl";

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
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
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
          <span className="text-lg font-bold tracking-tight">
            {tenantName}
          </span>
        </Link>

        {/* Search (desktop) */}
        <div className="hidden flex-1 items-center gap-4 px-8 lg:flex lg:max-w-xl">
          <AiSearchBar />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {[
            { href: "/", label: "Shop" },
            { href: "/register", label: "Open a store" },
            { href: "/support", label: "Support" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="nav-link-underline rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              {label}
            </Link>
          ))}

          <div className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-800" />

          <Link
            href="/login"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Account"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>

          <Link
            href="/wishlist"
            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Wishlist"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>

          <Link
            href="/cart"
            className="relative rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            aria-label="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-theme-accent text-[10px] font-bold text-white animate-scale-in">
                {cartCount}
              </span>
            )}
          </Link>

          <ThemeToggle />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <Link
            href="/cart"
            className="relative rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-theme-accent text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <MobileNav />
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t border-zinc-100 px-4 pb-3 dark:border-zinc-800/50 lg:hidden">
        <AiSearchBar />
      </div>
    </header>
  );
}
