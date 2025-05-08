import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { OperatorPeriodeAjarRouter } from "./periode-ajar/periode-ajar.router";

@Injectable()
export class OperatorRouter {
    constructor(
        private readonly trpc: TrpcService,
        private readonly periodeAjar: OperatorPeriodeAjarRouter
    ) {
    }

    router = this.trpc.router({
        periodeAjar: this.periodeAjar.router
    })
}