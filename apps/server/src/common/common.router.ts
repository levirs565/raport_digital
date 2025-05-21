import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { CommonService } from "./common.service";
import z from "zod";

@Injectable()
export class CommonRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly service: CommonService
  ) { }

  router = this.trpc.router({
    getAllPeriodeAjar: this.trpc.procedure.query(async () =>
      this.service.getAllPeriodeAjar()
    ),
    getSiswaList: this.trpc.procedure
      .input(z.object({
        filter: z.string().optional(),
        limit: z.number()
      }))
      .query(async ({ input }) => this.service.getSiswaList(input.filter, input.limit))
  })
}
