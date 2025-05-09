import { Injectable } from "@nestjs/common";
import { OperatorGuruService } from "./guru.service";
import { TrpcService } from "../../trpc/trpc.service";
import z from "zod";

@Injectable()
export class OperatorGuruRouter {
    constructor(
        private readonly service: OperatorGuruService,
        private readonly trpc: TrpcService
    ) {}

    router = this.trpc.router({
        getVerifiedAll: this.trpc.operatorProcedure
            .query(async () => await this.service.getVerifiedAll()),
        getUnverifiedAll: this.trpc.operatorProcedure
            .query(async () => await this.service.getUnverifiedAll()),
        verify: this.trpc.operatorProcedure
            .input(z.object({
                username: z.string(),
                accept: z.boolean()
            })).mutation(async ({ input }) => {
                await this.service.verify(input.username, input.accept);
                return true;
            })
    })
}