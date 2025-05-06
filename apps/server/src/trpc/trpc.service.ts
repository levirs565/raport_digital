import { Injectable } from "@nestjs/common";
import { initTRPC } from "@trpc/server";

@Injectable()
export class TrpcService {
    trpc = initTRPC.create()
    mergeRouters = this.trpc.mergeRouters
    publicProcedure = this.trpc.procedure;
    router = this.trpc.router
}