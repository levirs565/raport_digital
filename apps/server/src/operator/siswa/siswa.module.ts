import { Module } from '@nestjs/common';
import { OperatorSiswaService } from './siswa.service';
import { OperatorSiswaRouter } from './siswa.router';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrpcModule } from '../../trpc/trpc.module';
import { CommonModule } from '../../common/common.module';

@Module({
  providers: [OperatorSiswaService, OperatorSiswaRouter],
  exports: [OperatorSiswaRouter],
  imports: [PrismaModule, TrpcModule, CommonModule],
})
export class OperatorSiswaModule {}
