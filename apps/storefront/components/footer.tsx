import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer({ tenantName }: { tenantName: string }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-zinc-200/60 bg-white/50 dark:border-zinc-800/60 dark:bg-zinc-950/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">{tenantName}</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
            Curated luxury commerce powered by Nexora. Secure checkout, fast
            delivery, and AI-assisted discovery.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Shop
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-zinc-600 hover:text-amber-600 dark:text-zinc-400">
                Collection
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="text-zinc-600 hover:text-amber-600 dark:text-zinc-400">
                Wishlist
              </Link>
            </li>
            <li>
              <Link href="/cart" className="text-zinc-600 hover:text-amber-600 dark:text-zinc-400">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Help
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/support" className="text-zinc-600 hover:text-amber-600 dark:text-zinc-400">
                Support
              </Link>
            </li>
            <li>
              <Link href="/account" className="text-zinc-600 hover:text-amber-600 dark:text-zinc-400">
                My account
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-zinc-600 hover:text-amber-600 dark:text-zinc-400">
                Open a store
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200/60 px-6 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800/60">
        © {year} {tenantName}. Powered by Nexora Commerce.
      </div>
    </footer>
  );
}
