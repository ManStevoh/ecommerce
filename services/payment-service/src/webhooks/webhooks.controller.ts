import {
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentProvider } from '@nexora/shared-types';
import { Public } from '../common/tenant/public.decorator';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Public()
  @Post(':provider/:tenantId')
  async handle(
    @Param('provider') provider: PaymentProvider,
    @Param('tenantId') tenantId: string,
    @Headers('x-signature') genericSignature: string | undefined,
    @Headers('stripe-signature') stripeSignature: string | undefined,
    @Headers('x-paystack-signature') paystackSignature: string | undefined,
    @Headers('verif-hash') flutterwaveHash: string | undefined,
    @Req() req: Request & { rawBody?: Buffer },
    @Body() payload: unknown,
  ) {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(payload));
    const signature =
      stripeSignature ??
      paystackSignature ??
      flutterwaveHash ??
      genericSignature;

    return this.webhooksService.handle(
      provider,
      tenantId,
      signature,
      rawBody,
      payload,
    );
  }
}
