import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { GuruEkstrakurikulerRouter } from "./ekstrakurikuler/ekstrakurikuler.router";
import { GuruMataPelajaranRouter } from "./mata-pelajaran/mata-pelajaran.router";

@Injectable()
export class GuruRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly ekstrakurikuler: GuruEkstrakurikulerRouter,
    private readonly mataPelajaran: GuruMataPelajaranRouter
  ) {}

  router = this.trpc.router({
    ekstrakurikuler: this.ekstrakurikuler.router,
    mataPelajaran: this.mataPelajaran.router
  })
}
