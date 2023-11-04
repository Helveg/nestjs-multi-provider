import { Module } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { Listener } from '../tokens';

@Module({
  providers: [{ provide: Listener, useClass: TrackerService, multi: true }],
})
export class Plugin2Module {}
