import { Module } from "@nestjs/common";
import { KepalaSekolahRouter } from "./kepala-sekolah.router";
import { KepalaSekolahService } from "./kepala-sekolah.service";
import { PrismaModule } from "../prisma/prisma.module";
import { TrpcModule } from "../trpc/trpc.module";
import { CommonModule } from "../common/common.module";
import { RaportModule } from "../raport/raport.module";

@Module({
  providers: [KepalaSekolahRouter, KepalaSekolahService],
  imports: [PrismaModule, TrpcModule, CommonModule, RaportModule],
  exports: [KepalaSekolahRouter]
})
export class KepalaSekolahModule {

}
