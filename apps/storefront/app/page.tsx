import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { RecommendedProducts } from "@/components/recommended-products";
import { getTenantFromHeaders } from "@/lib/tenant";

export default async function HomePage() {
  const { displayName } = await getTenantFromHeaders();

  return (
    <div className="space-y-16">
      <Hero tenantName={displayName} />
      <section id="products">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Featured Pieces
            </h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Handpicked for {displayName}
            </p>
          </div>
        </div>
        <ProductGrid />
      </section>
      <RecommendedProducts />
    </div>
  );
}
