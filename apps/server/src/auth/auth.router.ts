import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { AuthService } from './auth.service';
import z from 'zod';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
const registerAkunGuruSchema = loginSchema.extend({
  namaLengkap: z.string(),
});

@Injectable()
export class AuthRouter {
  constructor(
    private readonly service: AuthService,
    private readonly trpc: TrpcService
  ) {}

  router = this.trpc.router({
    registerAkunGuru: this.trpc.procedure
      .meta({
        allowedRole: 'NOT-LOGGED',
      })
      .input(registerAkunGuruSchema)
      .mutation(async ({ input }) => {
        await this.service.createGuruAccount(
          input.username,
          input.password,
          input.namaLengkap
        );
        return true;
      }),
    state: this.trpc.procedure.query(
      ({
        ctx: {
          session: { account },
        },
      }) => {
        if (!account) return null;
        return {
          username: account.username,
          type: account.type,
          namaLengkap: account.namaLengkap,
          isVerified: account.isVerified,
        };
      }
    ),

    updatePassword: this.trpc.procedure
      .input(
        z.object({
          oldPassword: z.string(),
          newPassword: z.string(),
        })
      )
      .meta({
        allowedRole: 'LOGGED',
      })
      .mutation(async ({ ctx, input }) => {
        await this.service.changePassword(
          ctx.session.account!.username,
          input.oldPassword,
          input.newPassword
        );
        return true;
      }),
    getTandaTangan: this.trpc.procedure
      .meta({
        allowedRole: ['KEPALA_SEKOLAH', 'GURU'],
      })
      .query(async ({ ctx }) => {
        return await this.service.getTandaTangan(ctx.session.account!.username);
      }),
    updateTandaTangan: this.trpc.procedure
      .meta({
        allowedRole: ['KEPALA_SEKOLAH', 'GURU'],
      })
      .input(this.trpc.octetInputParse)
      .mutation(async ({ ctx, input }) => {
        await this.service.updateTandaTangan(
          ctx.session.account!.username,
          input
        );
        return true;
      }),
    getProfile: this.trpc.procedure.query(async ({ ctx }) => {
      return await this.service.getProfile(ctx.session.account!.username);
    }),
    updateProfile: this.trpc.procedure
      .meta({
        allowedRole: ['GURU', 'KEPALA_SEKOLAH'],
      })
      .input(
        z.object({
          nama_lengkap: z.string(),
          NIP: z.string().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await this.service.updateProfile(
          ctx.session.account!.username,
          ctx.session.account!.type,
          input
        );
        return true;
      }),
  });
}
