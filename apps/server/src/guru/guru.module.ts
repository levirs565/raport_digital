import { Module } from "@nestjs/common";
import { TrpcModule } from "../trpc/trpc.module";
import { GuruEkstrakurikulerModule } from "./ekstrakurikuler/ekstrakurikuler.module";
import { GuruRouter } from "./guru.router";

@Module({
  imports: [
    TrpcModule,
    GuruEkstrakurikulerModule
  ],
  providers: [GuruRouter],
  exports: [GuruRouter]
})
export class GuruModule {

}
