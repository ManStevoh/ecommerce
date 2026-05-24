import { Module } from "@nestjs/common";
import { MeilisearchClient } from "./meilisearch.client";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  controllers: [SearchController],
  providers: [SearchService, MeilisearchClient],
  exports: [SearchService],
})
export class SearchModule {}
