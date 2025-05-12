import { Module } from "@nestjs/common";
import { OperatorRouter } from "./operator.router.js";
import { OperatorPeriodeAjarModule } from "./periode-ajar/periode-ajar.module.js";
import { TrpcModule } from "../trpc/trpc.module.js";
import { OperatorMataPelajaranModule } from "./mata-pelajaran/mata-pelajaran.module.js";
import { OperatorGuruModule } from "./guru/guru.module.js";
import { OperatorSiswaModule } from "./siswa/siswa.module.js";

@Module({
    exports: [OperatorRouter],
    providers: [OperatorRouter],
    imports: [OperatorPeriodeAjarModule, OperatorMataPelajaranModule, OperatorGuruModule, OperatorSiswaModule, TrpcModule]
})
export class OperatorModule {

}