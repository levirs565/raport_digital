import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { AuthService } from "./auth.service";
import z from "zod";
import { $Enums } from "@prisma/client";

@Injectable()
export class AuthRouter {
    constructor(
        private readonly service: AuthService,
        private readonly trpc: TrpcService
    ) { }

    router = this.trpc.router({
        login: this.trpc.procedure
            .meta({
                allowedRole: "NOT-LOGGED"
            })
            .input(z.object({
                username: z.string(),
                password: z.string()
            })).mutation(async ({ ctx, input }) => {
                const result = await this.service.login(input.username, input.password);
                if (result.state == "SUCCESS") {
                    ctx.session.account = {
                        username: result.username,
                        type: result.type
                    }
                }
            }),
        logout: this.trpc.procedure
            .meta({
                allowedRole: "LOGGED"
            }).mutation(({ ctx }) => {
                ctx.session.account = undefined;
            }),
        state: this.trpc.procedure
            .query(({ ctx: { session: { account } } }) => {
                if (!account) return null;
                return {
                    username: account.username as string,
                    type: account.type as $Enums.AkunType
                }
            })
    })
}