import { Injectable } from '@nestjs/common';

@Injectable()
export class TrackerService {
  listen(message: string) {
    console.log('TrackerService of plugin2:', message);
  }
}
