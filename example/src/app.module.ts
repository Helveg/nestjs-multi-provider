import 'nestjs-multi-provider';
import { Inject, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Plugin1Module } from './plugin1/plugin1.module';
import { Plugin2Module } from './plugin2/plugin2.module';
import { Plugin3Module } from './plugin3/plugin3.module';
import { Listener, Value } from './tokens';
import { collect } from 'nestjs-multi-provider';

@Module({
  imports: [
    Plugin1Module,
    Plugin2Module,
    Plugin3Module,
    collect(Listener),
    collect(Value),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(
    @Inject(Value) values: number[],
    @Inject(Listener) listeners: { listen(message: string): void }[],
  ) {
    // Use setTimeout to neatly print this message at the end of the NestJS startup log.
    setTimeout(() => {
      console.log('Collected values:', values);
      // Send a message to all the listeners
      for (let listener of listeners) {
        listener.listen('Hello world');
      }
    });
  }
}
