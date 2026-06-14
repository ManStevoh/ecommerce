import { Shield, Truck, RotateCcw, Headphones } from "lucide-react";
import { ScrollAnimator } from "./scroll-animator";

const badges = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On orders over $100",
  },
  {
    icon: Shield,
    title: "Secure Payment",
    description: "256-bit SSL encryption",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "30-day hassle-free returns",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated customer care",
  },
];

export function TrustBadges() {
  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {badges.map((badge, i) => (
        <ScrollAnimator key={badge.title} delay={i * 0.08}>
          <div className="group flex flex-col items-center gap-3 rounded-2xl border border-zinc-200/40 bg-white/60 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800/40 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 transition-colors duration-300 group-hover:bg-theme-accent group-hover:text-white dark:bg-zinc-800">
              <badge.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">
                {badge.title}
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {badge.description}
              </p>
            </div>
          </div>
        </ScrollAnimator>
      ))}
    </section>
  );
}
