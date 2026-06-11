import { CreateExpressContextOptions } from '@trpc/server/adapters/express';

export async function createContext(opts: CreateExpressContextOptions) {
  const user = opts.req.user;
  if (user) {
    opts.req.session.account = user;
  }
  return {
    session: opts.req.session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
