import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { TrpcRouter } from "../trpc/trpc.router";

@Injectable()
export class AppRouter {
    constructor(
        private readonly trpc: TrpcService,
        private readonly trpcRouter: TrpcRouter
    ) { }
    
    router = this.trpc.mergeRouters (this.trpcRouter.router)
}

export type AppRouterType = AppRouter["router"];