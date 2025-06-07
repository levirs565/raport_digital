import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthRouter } from './auth.router';
import { TrpcModule } from '../trpc/trpc.module';
import { TandaTanganModule } from '../tanda-tangan/tanda-tangan.module';

@Module({
  providers: [AuthService, AuthRouter],
  exports: [AuthService, AuthRouter],
  imports: [PrismaModule, TrpcModule, TandaTanganModule],
})
export class AuthModule {}
