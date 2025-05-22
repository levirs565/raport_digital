import { Module } from '@nestjs/common';
import { OperatorGuruService } from './guru.service';
import { OperatorGuruRouter } from './guru.router';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  providers: [OperatorGuruService, OperatorGuruRouter],
  exports: [OperatorGuruRouter],
  imports: [PrismaModule, TrpcModule],
})
export class OperatorGuruModule {}
