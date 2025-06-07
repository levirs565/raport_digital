import { Inject, Injectable } from '@nestjs/common';
import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './trpc.context';
import { Meta } from '../types';
import { octetInputParser } from '@trpc/server/http';

// TODO: This is copied from original octetInputParser type
import { type ParserZodEsque } from '@trpc/server/unstable-core-do-not-import';
import { type ReadableStream } from 'node:stream/web';
export type UtilityParser<TInput, TOutput> = ParserZodEsque<TInput, TOutput> & {
  parse: (input: unknown) => TOutput;
};

export interface FileLike extends Blob {
  readonly name: string;
}

export type OctetInput = Blob | Uint8Array | FileLike;

@Injectable()
export class TrpcService {
  constructor(@Inject('SUPERJSON') private readonly superjson: any) {}
  trpc = initTRPC.context<Context>().meta<Meta>().create({
    transformer: this.superjson,
  });
  mergeRouters = this.trpc.mergeRouters;
  procedure = this.trpc.procedure.use(async (opts) => {
    const { meta, next, ctx } = opts;

    const throwForbidden = () => {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    };

    if (!meta?.allowedRole) return next();

    if (meta.allowedRole == 'NOT-LOGGED') {
      if (ctx.session.account) throwForbidden();
      return next();
    }

    if (!ctx.session.account) throwForbidden();

    if (
      meta.allowedRole != 'LOGGED' &&
      ((typeof meta.allowedRole == 'string' &&
        meta.allowedRole != ctx.session.account!.type) ||
        (typeof meta.allowedRole != 'string' &&
          !meta.allowedRole.includes(ctx.session.account!.type)))
    )
      throwForbidden();

    return next();
  });
  operatorProcedure = this.procedure.meta({
    allowedRole: 'OPERATOR',
  });
  guruProcedure = this.procedure.meta({
    allowedRole: 'GURU',
  });
  kepalaSekolahProcedure = this.procedure.meta({
    allowedRole: 'KEPALA_SEKOLAH',
  });
  router = this.trpc.router;

  octetInputParse = octetInputParser as unknown as UtilityParser<
    OctetInput,
    ReadableStream
  >;
}
