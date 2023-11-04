import { Module } from '@nestjs/common';
import { ComplexService } from './complex.service';
import { Listener } from '../tokens';
import { TransformerService } from './transformer.service';

@Module({
  providers: [
    {
      provide: Listener,
      useClass: ComplexService,
      multi: true,
      // note: When a service injects dependencies, you must set `standalone` to
      // `false` to have access to this module's providers. Internally a
      // `ForwardReference` to this module will be imported in the module that
      // collects this multi provider.
      standalone: false,
    },
    TransformerService,
  ],
})
export class Plugin3Module {}
