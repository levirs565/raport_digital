import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(opts: CreateExpressContextOptions) {
    return {
        session: opts.req.session
    }
}
export type Context = Awaited<ReturnType<typeof createContext>>;