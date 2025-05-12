import { Module } from "@nestjs/common";
import { TrpcService } from "./trpc.service";
import { TrpcRouter } from "./trpc.router";

@Module({
    providers: [TrpcService, TrpcRouter, {
        provide: 'SUPERJSON',
        useFactory: async () => await import("superjson")
    }],
    exports: [TrpcService, TrpcRouter],
})
export class TrpcModule {

}