import { ProductGrid } from "@/components/product-grid";
import { RecommendedProducts } from "@/components/recommended-products";
import { HomeHero } from "@/components/layouts/home-hero";
import { TrustBadges } from "@/components/trust-badges";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { ScrollAnimator } from "@/components/scroll-animator";
import { getTenantFromHeaders } from "@/lib/tenant";
import { resolveTheme } from "@nexora/themes";

export default async function HomePage() {
  const tenant = await getTenantFromHeaders();
  const resolved = resolveTheme(tenant.theme);

  return (
    <div className="space-y-20">
      {/* Hero */}
      <HomeHero
        tenantName={tenant.displayName}
        layoutVariant={resolved.layoutVariant}
      />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Products */}
      <section id="products">
        <ScrollAnimator>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Featured Pieces
            </h2>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Handpicked for {tenant.displayName}
            </p>
          </div>
        </ScrollAnimator>
        <ProductGrid />
      </section>

      {/* Recommendations */}
      <RecommendedProducts />

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
