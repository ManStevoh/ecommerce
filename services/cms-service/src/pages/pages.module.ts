import { Module } from '@nestjs/common';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { BlocksController } from '../blocks/blocks.controller';

@Module({
  controllers: [PagesController, BlocksController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
