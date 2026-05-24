import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/tenant/public.decorator';
import { PaymentProviderRegistry } from './payment-provider.registry';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly registry: PaymentProviderRegistry) {}

  @Public()
  @Get()
  list() {
    return { providers: this.registry.list() };
  }
}
