import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { LinkGoogleDto } from './dto/link-google.dto';

@Controller('auth/oauth/google')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get()
  initiate() {
    return this.oauthService.getGoogleAuthUrl();
  }

  @Get('callback')
  callback(@Query('code') code: string, @Query('state') state: string) {
    return this.oauthService.handleGoogleCallback(code, state);
  }

  @Post('link')
  link(@Body() dto: LinkGoogleDto) {
    return this.oauthService.linkGoogleAccount(dto.accessToken);
  }
}
