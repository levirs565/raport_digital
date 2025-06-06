import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { PrismaModule } from "../prisma/prisma.module";
import { CommonRouter } from "./common.router";
import { CommonService } from "./common.service";
import { CommonUtilsService } from "./common.utils.service";

@Module({
  imports: [TrpcModule, PrismaModule],
  providers: [CommonRouter, CommonService, CommonUtilsService],
  exports: [CommonRouter, CommonUtilsService]
})
export class CommonModule {

}
