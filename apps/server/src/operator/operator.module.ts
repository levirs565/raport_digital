import { Module } from "@nestjs/common";
import { OperatorRouter } from "./operator.router";
import { OperatorPeriodeAjarModule } from "./periode-ajar/periode-ajar.module";
import { TrpcModule } from "../trpc/trpc.module";

@Module({
    exports: [OperatorRouter],
    providers: [OperatorRouter],
    imports: [OperatorPeriodeAjarModule, TrpcModule]
})
export class OperatorModule {

}