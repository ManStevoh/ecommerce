import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../common/tenant/public.decorator';
import { PlatformAdminGuard } from './guards/platform-admin.guard';
import { PlatformPagesService } from './platform-pages.service';
import {
  CreatePlatformPageDto,
  UpdatePlatformPageDto,
} from './dto/platform-page.dto';
import { UpdatePlatformPageBlocksDto } from './dto/platform-page-blocks.dto';

@Controller('platform/pages')
export class PlatformPagesController {
  constructor(private readonly platformPagesService: PlatformPagesService) {}

  @Public()
  @Get('public/home')
  findHomepage() {
    return this.platformPagesService.findHomepage();
  }

  @Public()
  @Get('public/by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.platformPagesService.findBySlug(slug);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Get()
  findAll() {
    return this.platformPagesService.findAll();
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Post()
  create(@Body() dto: CreatePlatformPageDto) {
    return this.platformPagesService.create(dto);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.platformPagesService.findOne(id);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlatformPageDto) {
    return this.platformPagesService.update(id, dto);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Post(':id/publish')
  publish(@Param('id') id: string) {
    return this.platformPagesService.publish(id);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Put(':id/blocks')
  updateBlocks(
    @Param('id') id: string,
    @Body() dto: UpdatePlatformPageBlocksDto,
  ) {
    return this.platformPagesService.updateBlocks(id, dto);
  }

  @Public()
  @UseGuards(PlatformAdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.platformPagesService.remove(id);
  }
}
