import { Injectable } from '@nestjs/common';

@Injectable()
export class TransformerService {
  transform(message: string): string {
    return `We transformed '${message}'`;
  }
}
