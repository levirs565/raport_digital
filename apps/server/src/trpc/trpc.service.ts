import { Injectable } from "@nestjs/common";
import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./trpc.context";
import { Meta } from "../types";

@Injectable()
export class TrpcService {
    trpc = initTRPC.context<Context>().meta<Meta>().create()
    mergeRouters = this.trpc.mergeRouters
    procedure = this.trpc.procedure.use(async (opts) => {
        const { meta, next, ctx } = opts;

        const throwForbidden = () => {
            throw new TRPCError({
                code: "FORBIDDEN"
            });
        }

        if (!meta?.allowedRole) return next();
        
        if (meta.allowedRole == "NOT-LOGGED") {
            if (ctx.session.account) throwForbidden();
            return next();
        }

        if (!ctx.session.account) throwForbidden();

        if (meta.allowedRole != "LOGGED" && meta.allowedRole != ctx.session.account!.type)
            throwForbidden();

        return next();
    })
    router = this.trpc.router
}