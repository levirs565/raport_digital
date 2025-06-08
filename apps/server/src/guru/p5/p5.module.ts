import { Module } from "@nestjs/common";
import { TrpcModule } from "../../trpc/trpc.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { GuruP5Service } from "./p5.service";
import { GuruP5Router } from "./p5.router";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [TrpcModule, PrismaModule, CommonModule],
  providers: [GuruP5Service, GuruP5Router],
  exports: [GuruP5Router]
})
export class GuruP5Module {

}
