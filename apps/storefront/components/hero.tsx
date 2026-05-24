import Link from "next/link";
import { Button } from "@nexora/ui";
import { ArrowRight } from "lucide-react";

export function Hero({ tenantName }: { tenantName: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-card px-8 py-16 md:px-16 md:py-24">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-zinc-900/5 dark:from-amber-500/5 dark:to-zinc-50/5" />
      <div className="relative max-w-2xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
          {tenantName} Collection
        </p>
        <h1 className="text-4xl font-light tracking-tight md:text-6xl">
          Curated luxury,
          <span className="block font-semibold">redefined.</span>
        </h1>
        <p className="mt-6 text-lg text-zinc-600 dark:text-zinc-400">
          Discover exceptional pieces crafted for the discerning. AI-powered
          search helps you find exactly what you desire.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="#products">
            <Button variant="luxury" size="lg">
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="lg">
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
