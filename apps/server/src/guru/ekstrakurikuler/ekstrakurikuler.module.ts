import { Module } from "@nestjs/common";
import { TrpcModule } from "../../trpc/trpc.module";
import { GuruEkstrakurikulerService } from "./ekstrakurikuler.service";
import { GuruEkstrakurikulerRouter } from "./ekstrakurikuler.router";
import { PrismaModule } from "../../prisma/prisma.module";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [TrpcModule, PrismaModule, CommonModule],
  providers: [GuruEkstrakurikulerService, GuruEkstrakurikulerRouter],
  exports: [GuruEkstrakurikulerRouter]
})
export class GuruEkstrakurikulerModule {

}
