import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TrpcModule } from '../../trpc/trpc.module';
import { OperatorKelasService } from './kelas.service';
import { OperatorKelasRouter } from './kelas.router';

@Module({
  imports: [PrismaModule, TrpcModule],
  providers: [OperatorKelasService, OperatorKelasRouter],
  exports: [OperatorKelasRouter]
})
export class OperatorKelasModule {

}
