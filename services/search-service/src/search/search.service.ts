import { Injectable } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch.client";
import { SearchProductsDto } from "./dto/search-products.dto";

@Injectable()
export class SearchService {
  constructor(private readonly meilisearch: MeilisearchClient) {}

  async searchProducts(dto: SearchProductsDto) {
    const filters: string[] = [];
    if (dto.categories?.length) {
      filters.push(`category IN [${dto.categories.map((c) => `"${c}"`).join(", ")}]`);
    }
    if (dto.minPrice !== undefined) filters.push(`price >= ${dto.minPrice}`);
    if (dto.maxPrice !== undefined) filters.push(`price <= ${dto.maxPrice}`);

    const result = await this.meilisearch.search(dto.tenantId, {
      q: dto.q,
      filter: filters.length ? filters.join(" AND ") : undefined,
      facets: ["category", "brand"],
      limit: dto.limit ?? 20,
      offset: dto.offset ?? 0,
    });

    return {
      ...result,
      filters: {
        categories: dto.categories,
        priceRange: { min: dto.minPrice, max: dto.maxPrice },
      },
      features: ["product-search", "faceted-filters", "typo-tolerance"],
    };
  }

  async indexProduct(
    tenantId: string,
    document: {
      id: string;
      name: string;
      slug: string;
      price: number;
      description?: string | null;
    },
  ) {
    return this.meilisearch.indexProduct(tenantId, document);
  }

  async deleteProduct(tenantId: string, productId: string) {
    return this.meilisearch.deleteProduct(tenantId, productId);
  }
}
