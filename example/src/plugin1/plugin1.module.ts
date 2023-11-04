import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { Listener, Value } from '../tokens';

const Other = Symbol();

@Module({
  providers: [
    { provide: Listener, useClass: LoggingService, multi: true },
    { provide: Value, useValue: 1, multi: true },
    { provide: Value, useValue: 2, multi: true },
    { provide: Value, useFactory: () => 3, multi: true },
    // note: When using `useExisting` or `useFactory` with injected dependencies, you must
    // set `standalone` to `false` to have access to this module's providers. Internally a
    // `forwardReference` to this module will be imported in the module that collects this
    // multi provider.
    {
      provide: Value,
      useFactory: (other: number) => other + 1,
      inject: [Other],
      multi: true,
      standalone: false,
    },
    { provide: Other, useValue: 3 },
  ],
})
export class Plugin1Module {}
