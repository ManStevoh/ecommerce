import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  create(@Body() dto: CreateAttributeDto) {
    return this.attributesService.create(dto);
  }

  @Get()
  findAll() {
    return this.attributesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    return this.attributesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributesService.remove(id);
  }
}
