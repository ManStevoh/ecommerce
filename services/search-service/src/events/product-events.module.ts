import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { ProductEventsConsumer } from './product-events.consumer';

@Module({
  imports: [SearchModule],
  providers: [ProductEventsConsumer],
})
export class ProductEventsModule {}
