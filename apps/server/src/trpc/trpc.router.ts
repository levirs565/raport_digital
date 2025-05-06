import { INestApplication, Injectable } from "@nestjs/common";
import * as trpcExpress from "@trpc/server/adapters/express";
import { TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouter {
    constructor(private readonly trpc: TrpcService) {}
    
    haloCount = 0
    appRouter = this.trpc.router({
        test: this.trpc.publicProcedure.query(() => {
            this.haloCount++;
            return this.haloCount;
        })
    })

    async applyMiddleware(app: INestApplication) {
        app.use(`/trpc`, trpcExpress.createExpressMiddleware({
            router: this.appRouter
        }))
    }
}

export type AppRouter = TrpcRouter["appRouter"];