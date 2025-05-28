import { Module } from "@nestjs/common";
import { TrpcModule } from "../../trpc/trpc.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { GuruWaliKelasService } from "./wali-kelas.service";
import { GuruWaliKelasRouter } from "./wali-kelas.router";

@Module({
  imports: [TrpcModule, PrismaModule],
  providers: [GuruWaliKelasService, GuruWaliKelasRouter],
  exports: [GuruWaliKelasRouter]
})
export class GuruWaliKelasModule {

}
