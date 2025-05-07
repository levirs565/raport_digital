import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { AuthService } from "./auth.service";
import z from "zod";
import { TRPCError } from "@trpc/server";
import { $Enums } from "@prisma/client";

@Injectable()
export class AuthRouter {
    constructor(
        private readonly service: AuthService,
        private readonly trpc: TrpcService
    ) { }

    router = this.trpc.router({
        login: this.trpc.publicProcedure
            .input(z.object({
                username: z.string(),
                password: z.string()
            })).mutation(async ({ ctx, input }) => {
                if (ctx.session.account) {
                    throw new TRPCError({
                        code: "FORBIDDEN",
                        message: "You have logged in"
                    })
                }

                const result = await this.service.login(input.username, input.password);
                if (result.state == "SUCCESS") {
                    ctx.session.account = {
                        username: result.username,
                        type: result.type
                    }
                }
            }),
        state: this.trpc.publicProcedure
            .query(({ ctx: { session: { account } } }) => {
                if (!account) return null;
                return {
                    username: account.username as string,
                    type: account.type as $Enums.AkunType
                }
            })
    })
}