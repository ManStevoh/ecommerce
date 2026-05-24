import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { VariantsService } from './variants.service';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  create(@Body() dto: CreateVariantDto) {
    return this.variantsService.create(dto);
  }

  @Get()
  findByProduct(@Query('productId') productId: string) {
    return this.variantsService.findByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.variantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.variantsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variantsService.remove(id);
  }
}
