import Link from "next/link";
import { Button } from "@nexora/ui";
import { ArrowRight } from "lucide-react";

export function Hero({ tenantName }: { tenantName: string }) {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-card px-8 py-16 md:px-16 md:py-24">
      <div className="absolute inset-0 theme-hero-gradient" />
      <div className="relative max-w-2xl">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-theme-accent">
          {tenantName} Collection
        </p>
        <h1 className="text-4xl font-light tracking-tight md:text-6xl">
          Curated style,
          <span className="block font-semibold">your way.</span>
        </h1>
        <p className="mt-6 text-lg text-theme-muted">
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
