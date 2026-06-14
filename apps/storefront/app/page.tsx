import { ProductGrid } from "@/components/product-grid";
import { RecommendedProducts } from "@/components/recommended-products";
import { ScrollAnimator } from "@/components/scroll-animator";
import { getTenantFromHeaders } from "@/lib/tenant";

export default async function HomePage() {
  const tenant = await getTenantFromHeaders();

  return (
    <div className="space-y-20">
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

      <div className="fixed bottom-4 right-4 z-50 rounded bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
        Deploy Test: Active
      </div>
    </div>
  );
}
