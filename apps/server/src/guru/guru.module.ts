import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { GuruEkstrakurikulerModule } from "./ekstrakurikuler/ekstrakurikuler.module";
import { GuruRouter } from "./guru.router";
import { GuruMataPelajaranModule } from "./mata-pelajaran/mata-pelajaran.module";

@Module({
  imports: [
    TrpcModule,
    GuruEkstrakurikulerModule,
    GuruMataPelajaranModule
  ],
  providers: [GuruRouter],
  exports: [GuruRouter]
})
export class GuruModule {

}
