import {  Module } from "@nestjs/common";
import { OperatorSiswaService } from "./siswa.service";
import { OperatorSiswaRouter } from "./siswa.router";
import { PrismaModule } from "../../prisma/prisma.module";
import { TrpcModule } from "../../trpc/trpc.module";

@Module({
    providers: [OperatorSiswaService, OperatorSiswaRouter],
    exports: [OperatorSiswaRouter],
    imports: [PrismaModule, TrpcModule]
})
export class OperatorSiswaModule {

}