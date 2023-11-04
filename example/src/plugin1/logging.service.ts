import { Injectable } from '@nestjs/common';

@Injectable()
export class LoggingService {
  listen(message: string) {
    console.log('LoggingService of plugin1:', message);
  }
}
