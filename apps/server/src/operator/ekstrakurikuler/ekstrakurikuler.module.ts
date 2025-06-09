import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrpcModule } from '../../trpc/trpc.module';
import { OperatorEkstrakurikulerService } from './ekstrakurikuler.service';
import { OperatorEkstrakurikulerRouter } from './ekstrakurikuler.router';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [PrismaModule, TrpcModule, CommonModule],
  providers: [OperatorEkstrakurikulerService, OperatorEkstrakurikulerRouter],
  exports: [OperatorEkstrakurikulerRouter],
})
export class OperatorEkstrakurikulerModule {}
