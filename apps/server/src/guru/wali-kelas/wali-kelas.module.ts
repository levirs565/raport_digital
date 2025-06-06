import { Module } from "@nestjs/common";
import { TrpcModule } from "../../trpc/trpc.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { GuruWaliKelasService } from "./wali-kelas.service";
import { GuruWaliKelasRouter } from "./wali-kelas.router";
import { CommonModule } from "../../common/common.module";
import { RaportModule } from "../../raport/raport.module";

@Module({
  imports: [TrpcModule, PrismaModule, CommonModule, RaportModule],
  providers: [GuruWaliKelasService, GuruWaliKelasRouter],
  exports: [GuruWaliKelasRouter]
})
export class GuruWaliKelasModule {

}
