import { ProductGrid } from "@/components/product-grid";
import { RecommendedProducts } from "@/components/recommended-products";
import { HomeHero } from "@/components/layouts/home-hero";
import { getTenantFromHeaders } from "@/lib/tenant";
import { resolveTheme } from "@nexora/themes";

export default async function HomePage() {
  const tenant = await getTenantFromHeaders();
  const resolved = resolveTheme(tenant.theme);

  return (
    <div className="space-y-16">
      <HomeHero
        tenantName={tenant.displayName}
        layoutVariant={resolved.layoutVariant}
      />
      <section id="products">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured Pieces
            </h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Handpicked for {tenant.displayName}
            </p>
          </div>
        </div>
        <ProductGrid />
      </section>
      <RecommendedProducts />
    </div>
  );
}
