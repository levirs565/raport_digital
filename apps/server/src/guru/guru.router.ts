import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { GuruEkstrakurikulerRouter } from "./ekstrakurikuler/ekstrakurikuler.router";
import { GuruMataPelajaranRouter } from "./mata-pelajaran/mata-pelajaran.router";
import { GuruP5Router } from "./p5/p5.router";

@Injectable()
export class GuruRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly ekstrakurikuler: GuruEkstrakurikulerRouter,
    private readonly mataPelajaran: GuruMataPelajaranRouter,
    private readonly p5: GuruP5Router
  ) {}

  router = this.trpc.router({
    ekstrakurikuler: this.ekstrakurikuler.router,
    mataPelajaran: this.mataPelajaran.router,
    p5: this.p5.router
  })
}
