import { Injectable } from "@nestjs/common";
import { TrpcService } from "../trpc/trpc.service";
import { AuthService } from "./auth.service";
import z from "zod";
import { $Enums } from "@prisma/client";

const loginSchema = z.object({
    username: z.string(),
    password: z.string()
})
const registerAkunGuruSchema = loginSchema.extend({
    namaLengkap: z.string()
})

@Injectable()
export class AuthRouter {
    constructor(
        private readonly service: AuthService,
        private readonly trpc: TrpcService
    ) { }

    router = this.trpc.router({
        registerAkunGuru: this.trpc.procedure
            .meta({
                allowedRole: "NOT-LOGGED"
            })
            .input(registerAkunGuruSchema)
            .mutation(async ({ input }) => {
                await this.service.createGuruAccount(
                    input.username,
                    input.password,
                    input.namaLengkap
                )
                return true
            }),
        login: this.trpc.procedure
            .meta({
                allowedRole: "NOT-LOGGED"
            })
            .input(loginSchema)
            .mutation(async ({ ctx, input }) => {
                const result = await this.service.login(input.username, input.password);
                if (result.state == "SUCCESS") {
                    ctx.session.account = {
                        username: result.username,
                        type: result.type
                    }
                }
                return result;
            }),
        logout: this.trpc.procedure
            .meta({
                allowedRole: "LOGGED"
            }).mutation(({ ctx }) => {
                ctx.session.account = undefined;
                return true;
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