"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button, cn } from "@nexora/ui";

const links = [
  { href: "/", label: "Shop" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
  { href: "/support", label: "Support" },
  { href: "/login", label: "Sign in" },
  { href: "/register", label: "Register" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] w-72 border-l border-zinc-200 bg-white p-6 shadow-2xl transition-transform dark:border-zinc-800 dark:bg-zinc-950 lg:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
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
        <nav className="flex flex-col gap-1">
          {links.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
                )}
              >
                {label}
              </Link>
            );
          })}
          <Link href="/cart" onClick={() => setOpen(false)} className="mt-4">
            <Button variant="luxury" className="w-full">
              View cart
            </Button>
          </Link>
        </nav>
      </div>
    </>
  );
}
