import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { OperatorPeriodeAjarRouter } from './periode-ajar/periode-ajar.router';
import { OperatorMataPelajaranRouter } from './mata-pelajaran/mata_pelajaran.router';
import { OperatorGuruRouter } from './guru/guru.router';
import { OperatorSiswaRouter } from './siswa/siswa.router';
import { OperatorEkstrakurikulerRouter } from './ekstrakurikuler/ekstrakurikuler.router';
import { OperatorKelasRouter } from './kelas/kelas.router';

@Injectable()
export class OperatorRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly periodeAjar: OperatorPeriodeAjarRouter,
    private readonly mataPelajaran: OperatorMataPelajaranRouter,
    private readonly guru: OperatorGuruRouter,
    private readonly siswa: OperatorSiswaRouter,
    private readonly ekstrakurikuler: OperatorEkstrakurikulerRouter,
    private readonly kelas: OperatorKelasRouter
  ) {}

  router = this.trpc.router({
    periodeAjar: this.periodeAjar.router,
    mataPelajaran: this.mataPelajaran.router,
    guru: this.guru.router,
    siswa: this.siswa.router,
    ekstrakurikuler: this.ekstrakurikuler.router,
    kelas: this.kelas.router
  });
}
