import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { GuruEkstrakurikulerModule } from "./ekstrakurikuler/ekstrakurikuler.module";
import { GuruRouter } from "./guru.router";
import { GuruMataPelajaranModule } from "./mata-pelajaran/mata-pelajaran.module";
import { GuruP5Module } from "./p5/p5.module";

@Module({
  imports: [
    TrpcModule,
    GuruEkstrakurikulerModule,
    GuruMataPelajaranModule,
    GuruP5Module
  ],
  providers: [GuruRouter],
  exports: [GuruRouter]
})
export class GuruModule {

}
