import { Global, Module } from '@nestjs/common';
import { OpenAiClient } from './openai.client';

@Global()
@Module({
  providers: [OpenAiClient],
  exports: [OpenAiClient],
})
export class OpenAiModule {}
