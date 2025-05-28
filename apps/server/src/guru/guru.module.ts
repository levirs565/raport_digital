import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { GuruEkstrakurikulerModule } from "./ekstrakurikuler/ekstrakurikuler.module";
import { GuruRouter } from "./guru.router";
import { GuruMataPelajaranModule } from "./mata-pelajaran/mata-pelajaran.module";
import { GuruP5Module } from "./p5/p5.module";
import { GuruWaliKelasModule } from "./wali-kelas/wali-kelas.module";

@Module({
  imports: [
    TrpcModule,
    GuruEkstrakurikulerModule,
    GuruMataPelajaranModule,
    GuruP5Module,
    GuruWaliKelasModule
  ],
  providers: [GuruRouter],
  exports: [GuruRouter]
})
export class GuruModule {

}
