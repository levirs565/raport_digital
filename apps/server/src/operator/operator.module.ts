import { Module } from '@nestjs/common';
import { OperatorRouter } from './operator.router';
import { OperatorPeriodeAjarModule } from './periode-ajar/periode-ajar.module';
import { TrpcModule } from '../trpc/trpc.module';
import { OperatorMataPelajaranModule } from './mata-pelajaran/mata-pelajaran.module';
import { OperatorGuruModule } from './guru/guru.module';
import { OperatorSiswaModule } from './siswa/siswa.module';
import { OperatorEkstrakurikulerModule } from './ekstrakurikuler/ekstrakurikuler.module';
import { OperatorKelasModule } from './kelas/kelas.module';

@Module({
  exports: [OperatorRouter],
  providers: [OperatorRouter],
  imports: [
    OperatorPeriodeAjarModule,
    OperatorMataPelajaranModule,
    OperatorGuruModule,
    OperatorSiswaModule,
    OperatorEkstrakurikulerModule,
    OperatorKelasModule,
    TrpcModule,
  ],
})
export class OperatorModule {}
