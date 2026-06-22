import Link from "next/link";
import { Button } from "@nexora/ui";
import { ArrowRight, Star, Package, Users } from "lucide-react";
import type { LayoutVariant } from "@nexora/themes";

type Props = {
  tenantName: string;
  layoutVariant: LayoutVariant;
};

function HeroStats() {
  const stats = [
    { icon: Package, value: "10K+", label: "Products" },
    { icon: Users, value: "50K+", label: "Customers" },
    { icon: Star, value: "4.9", label: "Rating" },
  ];

  return (
    <div className="mt-10 flex flex-wrap items-center gap-8">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
            <stat.icon className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight">{stat.value}</p>
            <p className="text-xs text-zinc-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomeHero({ tenantName, layoutVariant }: Props) {
  if (layoutVariant === "editorial") {
    return (
      <section className="relative overflow-hidden rounded-[var(--tenant-radius,1.5rem)] px-8 py-16 md:px-14 md:py-24">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />

        {/* Animated blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-amber-500/8 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full bg-violet-500/8 blur-3xl animate-float-2" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[300px] w-[300px] rounded-full bg-rose-500/5 blur-3xl animate-float" />

        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div className="text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {tenantName}
            </div>
            <h1 className="text-4xl font-light leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Stories worth
              <span className="block font-bold bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                wearing home.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-zinc-400">
              Editorial picks and seasonal edits — discover what defines your
              store this week.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#products">
                <Button variant="luxury" size="lg" className="rounded-xl gap-2">
                  Shop the edit
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <HeroStats />
          </div>

          {/* Visual panel */}
          <div className="relative hidden md:block">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-sm font-medium text-zinc-300">New Season</p>
                <p className="mt-1 text-2xl font-bold text-white">SS26 Collection</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (layoutVariant === "minimal") {
    return (
      <section className="relative overflow-hidden rounded-3xl py-14 text-center md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-800/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {tenantName}
          </div>
          <h1 className="mx-auto max-w-xl text-3xl font-medium tracking-tight md:text-4xl lg:text-5xl">
            Essentials,{" "}
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
              refined.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-zinc-500 dark:text-zinc-400">
            A focused catalog with no distractions — just what your customers
            need.
          </p>
          <div className="mt-8">
            <Link href="#products">
              <Button variant="luxury" size="lg" className="rounded-xl">
                Browse products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (layoutVariant === "modern") {
    return (
      <section className="relative overflow-hidden rounded-[var(--tenant-radius,1.5rem)] bg-zinc-950 p-8 py-20 text-white md:p-16 md:py-28">
        <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl animate-pulse" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-amber-500/10 blur-3xl animate-float" />
        
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
            {tenantName}
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
            A New Era of
            <span className="block bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent font-serif italic font-normal">
              Style and Design.
            </span>
          </h1>
          <p className="mt-6 text-base text-zinc-400">
            Explore the newly designed Modern Gallery layout. Clean, borderless grid, and premium details.
          </p>
          <div className="mt-8">
            <Link href="#products">
              <Button variant="luxury" size="lg" className="rounded-full px-8 py-6 text-sm font-semibold tracking-wider hover:scale-105 transition-all duration-300">
                Browse Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  // Classic (default)
  return (
    <section className="relative overflow-hidden rounded-3xl px-8 py-20 md:px-16 md:py-28">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900" />

      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-500/8 blur-3xl animate-float-2" />
      <div className="pointer-events-none absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-3xl animate-float" />

      <div className="relative max-w-2xl text-white">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {tenantName} Collection
        </div>
        <h1 className="text-4xl font-light tracking-tight md:text-6xl lg:text-7xl">
          Curated style,
          <span className="block font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent">
            your way.
          </span>
        </h1>
        <p className="mt-6 max-w-lg text-lg text-zinc-400">
          Discover exceptional pieces crafted for the discerning. AI-powered
          search helps you find exactly what you desire.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#products">
            <Button variant="luxury" size="lg" className="rounded-xl gap-2">
              Explore Collection
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/cart">
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl border-white/20 text-white hover:bg-white/10"
            >
              View Cart
            </Button>
          </Link>
        </div>
        <HeroStats />
      </div>
    </section>
  );
}
