import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { SegmentsService } from './segments.service';
import { CreateSegmentDto, UpdateSegmentDto } from './dto/create-segment.dto';

@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Post()
  create(@Body() dto: CreateSegmentDto) {
    return this.segmentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.segmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.segmentsService.findOne(id);
  }

  @Post(':id/evaluate')
  evaluate(@Param('id') id: string) {
    return this.segmentsService.evaluate(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSegmentDto) {
    return this.segmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.segmentsService.remove(id);
  }
}
