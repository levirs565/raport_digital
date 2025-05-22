import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { GuruEkstrakurikulerRouter } from "./ekstrakurikuler/ekstrakurikuler.router";

@Injectable()
export class GuruRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly ekstrakurikuler: GuruEkstrakurikulerRouter
  ) {}

  router = this.trpc.router({
    ekstrakurikuler: this.ekstrakurikuler.router
  })
}
