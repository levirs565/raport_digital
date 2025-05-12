import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service.js";
import { OperatorPeriodeAjarRouter } from "./periode-ajar/periode-ajar.router.js";
import { OperatorMataPelajaranRouter } from "./mata-pelajaran/mata_pelajaran.router.js";
import { OperatorGuruRouter } from "./guru/guru.router.js";
import { OperatorSiswaRouter } from "./siswa/siswa.router.js";
import { OperatorEkstrakurikulerRouter } from "./ekstrakurikuler/ekstrakurikuler.router.js";

@Injectable()
export class OperatorRouter {
    constructor(
        private readonly trpc: TrpcService,
        private readonly periodeAjar: OperatorPeriodeAjarRouter,
        private readonly mataPelajaran: OperatorMataPelajaranRouter,
        private readonly guru: OperatorGuruRouter,
        private readonly siswa: OperatorSiswaRouter,
        private readonly ekstrakurikuler: OperatorEkstrakurikulerRouter,
    ) {
    }

    router = this.trpc.router({
        periodeAjar: this.periodeAjar.router,
        mataPelajaran: this.mataPelajaran.router,
        guru: this.guru.router,
        siswa: this.siswa.router,
        ekstrakurikuler: this.ekstrakurikuler.router
    })
}