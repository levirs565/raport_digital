import { Module } from "@nestjs/common";
import { OperatorRouter } from "./operator.router";
import { OperatorPeriodeAjarModule } from "./periode-ajar/periode-ajar.module";
import { TrpcModule } from "../trpc/trpc.module";
import { OperatorMataPelajaranModule } from "./mata-pelajaran/mata-pelajaran.module";

@Module({
    exports: [OperatorRouter],
    providers: [OperatorRouter],
    imports: [OperatorPeriodeAjarModule, OperatorMataPelajaranModule, TrpcModule]
})
export class OperatorModule {

}