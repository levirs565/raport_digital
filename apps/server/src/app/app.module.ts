import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrpcModule } from '../trpc/trpc.module';
import { AppRouter } from './app.router';

@Module({
  imports: [TrpcModule],
  controllers: [AppController],
  providers: [AppService, AppRouter],
})
export class AppModule {
}
