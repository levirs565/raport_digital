import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrpcModule } from '../../trpc/trpc.module';
import { OperatorEkstrakurikulerService } from './ekstrakurikuler.service';
import { OperatorEkstrakurikulerRouter } from './ekstrakurikuler.router';

@Module({
  imports: [PrismaModule, TrpcModule],
  providers: [OperatorEkstrakurikulerService, OperatorEkstrakurikulerRouter],
  exports: [OperatorEkstrakurikulerRouter],
})
export class OperatorEkstrakurikulerModule {}
