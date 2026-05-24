import Link from "next/link";
import { Button } from "@nexora/ui";
import { ArrowRight } from "lucide-react";
import type { LayoutVariant } from "@nexora/themes";

type Props = {
  tenantName: string;
  layoutVariant: LayoutVariant;
};

export function HomeHero({ tenantName, layoutVariant }: Props) {
  if (layoutVariant === "editorial") {
    return (
      <section className="relative overflow-hidden rounded-[var(--tenant-radius)] glass-card px-8 py-14 md:px-12 md:py-20">
        <div className="absolute inset-0 theme-hero-gradient" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-theme-accent">
              {tenantName}
            </p>
            <h1 className="text-4xl font-light leading-tight tracking-tight md:text-5xl">
              Stories worth
              <span className="block font-semibold">wearing home.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-theme-muted">
              Editorial picks and seasonal edits — discover what defines your
              store this week.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#products">
                <Button variant="luxury" size="lg">
                  Shop the edit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden min-h-[280px] rounded-[var(--tenant-radius)] border border-theme-border bg-theme-surface md:block" />
        </div>
      </section>
    );
  }

  if (layoutVariant === "minimal") {
    return (
      <section className="py-10 text-center md:py-14">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-theme-accent">
          {tenantName}
        </p>
        <h1 className="mx-auto max-w-xl text-3xl font-medium tracking-tight md:text-4xl">
          Essentials, refined.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-theme-muted">
          A focused catalog with no distractions — just what your customers
          need.
        </p>
        <div className="mt-6">
          <Link href="#products">
            <Button variant="luxury" size="default">
              Browse products
            </Button>
          </Link>
        </div>
      </section>
    );
  }

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
