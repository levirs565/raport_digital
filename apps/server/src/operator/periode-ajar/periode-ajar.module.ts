import { Module } from "@nestjs/common";
import { OperatorPeriodeAjarService } from "./periode-ajar.service";
import { OperatorPeriodeAjarRouter } from "./periode-ajar.router";
import { TrpcModule } from "../../trpc/trpc.module";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
    providers: [OperatorPeriodeAjarService, OperatorPeriodeAjarRouter],
    exports: [OperatorPeriodeAjarRouter],
    imports: [TrpcModule, PrismaModule]
})
export class OperatorPeriodeAjarModule {

}