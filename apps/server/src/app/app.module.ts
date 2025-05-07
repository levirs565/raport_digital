import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TrpcModule } from '../trpc/trpc.module';
import { AppRouter } from './app.router';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    TrpcModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, AppRouter],
})
export class AppModule implements NestModule {
  constructor(
    private readonly prismaClient: PrismaService, 
    private readonly configService: ConfigService
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      session({
        store: new PrismaSessionStore(this.prismaClient, {
          checkPeriod: 2 * 60 * 1000,  //ms
          dbRecordIdIsSessionId: true,
          dbRecordIdFunction: undefined,
        }),
        secret: this.configService.getOrThrow<string>("SESSION_SECRET"),
        resave: true
      })
    ).forRoutes("*");
  }
}
