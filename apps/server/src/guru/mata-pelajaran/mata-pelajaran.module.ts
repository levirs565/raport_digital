import { Module } from "@nestjs/common";
import { TrpcModule } from "../../trpc/trpc.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { GuruMataPelajaranService } from "./mata-pelajaran.service";
import { GuruMataPelajaranRouter } from "./mata-pelajaran.router";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [TrpcModule, PrismaModule, CommonModule],
  providers: [GuruMataPelajaranService, GuruMataPelajaranRouter],
  exports: [GuruMataPelajaranRouter]
})
export class GuruMataPelajaranModule {

}
