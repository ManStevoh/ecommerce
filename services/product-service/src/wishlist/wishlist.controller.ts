import { Body, Controller, Delete, Get, Headers, Post } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  list(@Headers('x-user-id') userId: string) {
    return this.wishlistService.list(userId);
  }

  @Post()
  add(
    @Headers('x-user-id') userId: string,
    @Body('productId') productId: string,
  ) {
    return this.wishlistService.add(userId, productId);
  }

  @Delete()
  remove(
    @Headers('x-user-id') userId: string,
    @Body('productId') productId: string,
  ) {
    return this.wishlistService.remove(userId, productId);
  }
}
