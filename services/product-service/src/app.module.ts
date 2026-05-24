import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventBusModule } from '@nexora/event-bus';
import { DatabaseModule } from './database/database.module';
import { TenantModule } from './common/tenant/tenant.module';
import { ProductEventsModule } from './events/product-events.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { AttributesModule } from './attributes/attributes.module';
import { VariantsModule } from './variants/variants.module';
import { InventoryModule } from './inventory/inventory.module';
import { BrandsModule } from './brands/brands.module';
import { SearchModule } from './search/search.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { WarehousesModule } from './warehouses/warehouses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventBusModule.forRoot({ queueName: 'nexora.events' }),
    DatabaseModule,
    TenantModule,
    ProductEventsModule,
    ProductsModule,
    CategoriesModule,
    AttributesModule,
    VariantsModule,
    InventoryModule,
    BrandsModule,
    SearchModule,
    ReviewsModule,
    WishlistModule,
    WarehousesModule,
  ],
})
export class AppModule {}