import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { IndexProductDto } from './dto/index-product.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('products')
  searchProducts(@Query() dto: SearchProductsDto) {
    return this.searchService.searchProducts(dto);
  }

  @Post('index')
  indexProduct(@Body() dto: IndexProductDto) {
    const { tenantId, ...document } = dto;
    return this.searchService.indexProduct(tenantId, document);
  }

  @Delete('index')
  deleteProduct(
    @Query('tenantId') tenantId: string,
    @Query('productId') productId: string,
  ) {
    return this.searchService.deleteProduct(tenantId, productId);
  }
}
