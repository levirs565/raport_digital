import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { OperatorPeriodeAjarRouter } from "./periode-ajar/periode-ajar.router";
import { OperatorMataPelajaranRouter } from "./mata-pelajaran/mata_pelajaran.router";

@Injectable()
export class OperatorRouter {
    constructor(
        private readonly trpc: TrpcService,
        private readonly periodeAjar: OperatorPeriodeAjarRouter,
        private readonly mataPelajaran: OperatorMataPelajaranRouter
    ) {
    }

    router = this.trpc.router({
        periodeAjar: this.periodeAjar.router,
        mataPelajaran: this.mataPelajaran.router
    })
}