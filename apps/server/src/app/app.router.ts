import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { TrpcRouter } from "../trpc/trpc.router";
import { AuthRouter } from "../auth/auth.router";

@Injectable()
export class AppRouter {
    constructor(
        private readonly trpc: TrpcService,
        private readonly trpcRouter: TrpcRouter,
        private readonly authRouter: AuthRouter
    ) { }
    
    router = this.trpc.mergeRouters (
        this.trpcRouter.router,
        this.trpc.router({
            auth: this.authRouter.router
        })
    )
}

export type AppRouterType = AppRouter["router"];