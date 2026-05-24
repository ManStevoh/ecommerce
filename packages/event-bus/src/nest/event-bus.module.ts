import { DynamicModule, Global, Module } from '@nestjs/common';
import { EventBusService, type EventBusOptions } from './event-bus.service';

export const EVENT_BUS_OPTIONS = 'EVENT_BUS_OPTIONS';

@Global()
@Module({})
export class EventBusModule {
  static forRoot(options: EventBusOptions = {}): DynamicModule {
    return {
      module: EventBusModule,
      providers: [
        { provide: EVENT_BUS_OPTIONS, useValue: options },
        {
          provide: EventBusService,
          useFactory: () => new EventBusService(options),
        },
      ],
      exports: [EventBusService],
    };
  }
}

export { EventBusService } from './event-bus.service';
