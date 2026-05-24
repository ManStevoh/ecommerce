import { Body, Controller, Put, Param } from '@nestjs/common';
import { PagesService } from '../pages/pages.service';
import { UpdatePageBlocksDto } from '../pages/dto/update-page-blocks.dto';

@Controller('pages/:pageId/blocks')
export class BlocksController {
  constructor(private readonly pagesService: PagesService) {}

  @Put()
  updateBlocks(
    @Param('pageId') pageId: string,
    @Body() dto: UpdatePageBlocksDto,
  ) {
    return this.pagesService.updateBlocks(pageId, dto);
  }
}
