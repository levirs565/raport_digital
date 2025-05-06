import { Injectable } from "@nestjs/common";
import { TrpcService } from "./trpc.service";

@Injectable()
export class TrpcRouter {
    constructor(private readonly trpc: TrpcService) {}
    
    haloCount = 0
    router = this.trpc.router({
        test: this.trpc.publicProcedure.query(() => {
            this.haloCount++;
            return this.haloCount;
        })
    })
}