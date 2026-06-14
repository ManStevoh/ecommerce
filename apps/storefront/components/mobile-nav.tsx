"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingCart, Heart, User, Home, HelpCircle, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { Button, cn } from "@nexora/ui";

const links = [
  { href: "/", label: "Shop", icon: Home },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account", label: "Account", icon: User },
  { href: "/support", label: "Support", icon: HelpCircle },
  { href: "/register", label: "Open a store", icon: Store },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Prevent body scroll when nav is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:scale-110 transition-transform duration-300" />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] w-80 border-l border-zinc-200/50 bg-white/95 backdrop-blur-2xl shadow-2xl transition-all duration-300 ease-out-expo dark:border-zinc-800/50 dark:bg-zinc-950/95 lg:hidden",
          open ? "translate-x-0 visible opacity-100" : "translate-x-full invisible opacity-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800/50">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Menu
            </span>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <div className="flex flex-col gap-1">
              {links.map(({ href, label, icon: Icon }, i) => {
                const active =
                  href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      open && `animate-slide-in-right`,
                      active
                        ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                        : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900",
                    )}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {active && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-theme-accent" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Bottom CTA */}
          <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800/50">
            <Link href="/cart" onClick={() => setOpen(false)}>
              <Button variant="luxury" className="w-full gap-2 rounded-xl">
                <ShoppingCart className="h-4 w-4" />
                View cart
              </Button>
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-2 block"
            >
              <Button variant="outline" className="w-full rounded-xl">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
