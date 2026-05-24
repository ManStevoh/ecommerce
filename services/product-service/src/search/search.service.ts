import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { SearchQueryDto } from './dto/search-query.dto';

@Injectable()
export class SearchService {
  private readonly searchServiceUrl: string;

  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly config: ConfigService,
  ) {
    this.searchServiceUrl =
      this.config.get<string>('SEARCH_SERVICE_URL') ?? 'http://localhost:3009';
  }

  async search(query: SearchQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { q, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    try {
      const params = new URLSearchParams({
        tenantId,
        q: q ?? '',
        limit: String(limit),
        offset: String(offset),
      });
      const res = await fetch(
        `${this.searchServiceUrl}/api/v1/search/products?${params}`,
      );
      if (!res.ok) {
        return this.emptyResult(tenantId, q, page, limit);
      }
      const data = (await res.json()) as {
        hits?: Array<{ id: string; name: string; slug?: string; _rankingScore?: number }>;
        estimatedTotalHits?: number;
      };
      const hits = (data.hits ?? []).map((hit) => ({
        id: hit.id,
        name: hit.name,
        score: hit._rankingScore ?? 1,
      }));
      return {
        tenantId,
        query: q,
        pagination: {
          page,
          limit,
          total: data.estimatedTotalHits ?? hits.length,
        },
        hits,
      };
    } catch {
      return this.emptyResult(tenantId, q, page, limit);
    }
  }

  private emptyResult(
    tenantId: string,
    q: string | undefined,
    page: number,
    limit: number,
  ) {
    return {
      tenantId,
      query: q,
      pagination: { page, limit, total: 0 },
      hits: [] as Array<{ id: string; name: string; score: number }>,
    };
  }
}
