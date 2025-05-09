import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { OperatorPeriodeAjarRouter } from "./periode-ajar/periode-ajar.router";
import { OperatorMataPelajaranRouter } from "./mata-pelajaran/mata_pelajaran.router";
import { OperatorGuruRouter } from "./guru/guru.router";

@Injectable()
export class OperatorRouter {
    constructor(
        private readonly trpc: TrpcService,
        private readonly periodeAjar: OperatorPeriodeAjarRouter,
        private readonly mataPelajaran: OperatorMataPelajaranRouter,
        private readonly guru: OperatorGuruRouter
    ) {
    }

    router = this.trpc.router({
        periodeAjar: this.periodeAjar.router,
        mataPelajaran: this.mataPelajaran.router,
        guru: this.guru.router
    })
}