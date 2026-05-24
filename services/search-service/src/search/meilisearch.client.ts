import { MeiliSearch } from 'meilisearch';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

export interface MeilisearchSearchParams {
  q: string;
  filter?: string;
  facets?: string[];
  limit?: number;
  offset?: number;
}

@Injectable()
export class MeilisearchClient implements OnModuleInit {
  private readonly logger = new Logger(MeilisearchClient.name);
  private client!: MeiliSearch;
  private readonly host = process.env.MEILISEARCH_HOST ?? 'http://localhost:7700';
  private readonly apiKey = process.env.MEILISEARCH_API_KEY ?? 'masterKey';

  onModuleInit(): void {
    this.client = new MeiliSearch({
      host: this.host,
      apiKey: this.apiKey,
    });
    this.logger.log(`Meilisearch client ready (${this.host})`);
  }

  getIndexName(tenantId: string): string {
    return `products_${tenantId.replace(/-/g, '')}`;
  }

  private async ensureIndex(tenantId: string) {
    const indexName = this.getIndexName(tenantId);
    try {
      await this.client.getIndex(indexName);
    } catch {
      const task = await this.client.createIndex(indexName, { primaryKey: 'id' });
      await this.client.waitForTask(task.taskUid);
      const index = this.client.index(indexName);
      await index.updateSearchableAttributes(['name', 'description', 'slug', 'sku']);
      await index.updateFilterableAttributes(['category', 'price', 'isActive']);
    }
    return this.client.index(indexName);
  }

  async search(tenantId: string, params: MeilisearchSearchParams) {
    const index = await this.ensureIndex(tenantId);
    return index.search(params.q, {
      filter: params.filter,
      facets: params.facets,
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    });
  }

  async indexProduct(
    tenantId: string,
    document: {
      id: string;
      name: string;
      slug: string;
      price: number;
      description?: string | null;
      sku?: string;
      category?: string;
      isActive?: boolean;
    },
  ) {
    const index = await this.ensureIndex(tenantId);
    const task = await index.addDocuments([
      {
        ...document,
        isActive: document.isActive ?? true,
      },
    ]);
    await this.client.waitForTask(task.taskUid);
    return { indexed: true, index: this.getIndexName(tenantId), documentId: document.id };
  }

  async deleteProduct(tenantId: string, productId: string) {
    const index = await this.ensureIndex(tenantId);
    const task = await index.deleteDocument(productId);
    await this.client.waitForTask(task.taskUid);
    return { deleted: true, documentId: productId };
  }
}
