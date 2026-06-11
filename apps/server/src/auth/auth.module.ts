import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRouter } from './auth.router';
import { TrpcModule } from '../trpc/trpc.module';
import { TandaTanganModule } from '../tanda-tangan/tanda-tangan.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthRouter, LocalStrategy, SessionSerializer],
  exports: [AuthService, AuthRouter],
  imports: [
    PrismaModule,
    TrpcModule,
    TandaTanganModule,
    PassportModule.register({ session: true }),
  ],
})
export class AuthModule {}
