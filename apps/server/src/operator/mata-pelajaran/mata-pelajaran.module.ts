import { Module } from '@nestjs/common';
import { OperatorMataPelajaranService } from './mata_pelajaran.service';
import { OperatorMataPelajaranRouter } from './mata_pelajaran.router';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrpcModule } from '../../trpc/trpc.module';

@Module({
  providers: [OperatorMataPelajaranService, OperatorMataPelajaranRouter],
  exports: [OperatorMataPelajaranRouter],
  imports: [PrismaModule, TrpcModule],
})
export class OperatorMataPelajaranModule {}
