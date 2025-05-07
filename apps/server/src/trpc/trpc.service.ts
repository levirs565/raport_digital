import { Injectable } from "@nestjs/common";
import { initTRPC } from "@trpc/server";
import { Context } from "./trpc.context";

@Injectable()
export class TrpcService {
    trpc = initTRPC.context<Context>().create()
    mergeRouters = this.trpc.mergeRouters
    publicProcedure = this.trpc.procedure;
    router = this.trpc.router
}