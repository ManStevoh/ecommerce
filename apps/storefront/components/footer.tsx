"use client";

import Link from "next/link";
import { Sparkles, ArrowUp, Mail } from "lucide-react";
import type { LayoutVariant } from "@nexora/themes";
import { Button, Input } from "@nexora/ui";
import { useState } from "react";

export function Footer({
  tenantName,
  variant = "classic",
}: {
  tenantName: string;
  variant?: LayoutVariant;
}) {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const widthClass =
    variant === "minimal"
      ? "max-w-5xl"
      : variant === "editorial"
        ? "max-w-6xl"
        : "max-w-[1600px]";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-20 border-t border-zinc-200/40 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:border-zinc-800/40 dark:from-zinc-900 dark:to-zinc-950">
      <div
        className={`mx-auto ${widthClass} px-6 py-14`}
      >
        <div className="grid gap-10 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                {tenantName}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              Curated luxury commerce powered by Nexora. Secure checkout, fast
              delivery, and AI-assisted product discovery.
            </p>
            {/* Mini newsletter */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
              className="mt-5 flex gap-2"
            >
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="h-9 rounded-lg pl-9 text-sm"
                />
              </div>
              <Button
                type="submit"
                variant="luxury"
                size="sm"
                className="rounded-lg px-4 text-xs"
              >
                Subscribe
              </Button>
            </form>
          </div>

          {/* Shop links */}
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500">
              Shop
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/", label: "Collection" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/cart", label: "Cart" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500">
              Help
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                { href: "/support", label: "Support" },
                { href: "/account", label: "My account" },
                { href: "/register", label: "Open a store" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div className="md:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500">
              About
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li className="text-zinc-600 dark:text-zinc-400">
                Multi-tenant ecommerce platform
              </li>
              <li className="text-zinc-600 dark:text-zinc-400">
                AI-powered product discovery
              </li>
              <li className="text-zinc-600 dark:text-zinc-400">
                Secure Stripe payments
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-200/40 dark:border-zinc-800/40">
        <div
          className={`mx-auto flex ${widthClass} flex-col items-center justify-between gap-3 px-6 py-4 sm:flex-row`}
        >
          <p className="text-xs text-zinc-500">
            © {year} {tenantName}. Powered by Nexora Commerce.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="group inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-all hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:hover:border-zinc-600 dark:hover:text-zinc-100"
          >
            Back to top
            <ArrowUp className="h-3 w-3 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
