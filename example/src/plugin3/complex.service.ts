import { Injectable } from '@nestjs/common';
import { TransformerService } from './transformer.service';

@Injectable()
export class ComplexService {
  // note: When a multi-provider service needs to inject dependencies, you must set
  // `standalone` to `false` to have access to this module's providers. Internally a
  // `ForwardReference` to the module will be imported in the module that collects
  // this multi provider.
  constructor(private transformer: TransformerService) {}

  listen(message: string) {
    console.log(
      'ComplexService, operating with standalone=false, transformed the message to:',
      this.transformer.transform(message),
    );
  }
}
