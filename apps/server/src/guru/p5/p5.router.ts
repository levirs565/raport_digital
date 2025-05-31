import { Injectable } from '@nestjs/common';
import { GuruP5Service } from './p5.service';
import { TrpcService } from '../../trpc/trpc.service';
import { periodeAjarIdSchema } from '../../common';
import z from 'zod';
import { extractFields } from '../../utils';

const idSchema = z.object({
  id_kelas: z.string().uuid(),
});

const proyekSchema = z.object({
  tema: z.string(),
  judul: z.string(),
  deskripsi: z.string(),
});

const proyekIdSchema = z.object({
  id_proyek: z.string().uuid(),
});

const targetSchema = z.object({
  dimensi: z.string(),
  elemen: z.string(),
  subelemen: z.string(),
  target: z.string(),
});

const targetIdSchema = z.object({
  id_target: z.string().uuid(),
});

@Injectable()
export class GuruP5Router {
  constructor(
    private readonly trpc: TrpcService,
    private readonly service: GuruP5Service
  ) {}

  router = this.trpc.router({
    getAll: this.trpc.guruProcedure
      .input(periodeAjarIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getAll(
            ctx.session.account!.username,
            input.periode_ajar_id
          )
      ),
    get: this.trpc.guruProcedure
      .input(idSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.get(ctx.session.account!.username, input.id_kelas)
      ),
    getProyekList: this.trpc.guruProcedure
      .input(idSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getProyekList(
            ctx.session.account!.username,
            input.id_kelas
          )
      ),
    addProyek: this.trpc.guruProcedure
      .input(idSchema.extend(proyekSchema.shape))
      .mutation(
        async ({ input, ctx }) =>
          await this.service.addProyek(
            ctx.session.account!.username,
            input.id_kelas,
            extractFields(proyekSchema, input)
          )
      ),
    updateProyek: this.trpc.guruProcedure
      .input(proyekIdSchema.extend(proyekSchema.shape))
      .mutation(async ({ input, ctx }) => {
        await this.service.updateProyek(
          ctx.session.account!.username,
          input.id_proyek,
          extractFields(proyekSchema, input)
        );
        return true;
      }),
    getProyek: this.trpc.guruProcedure
      .input(proyekIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getProyek(
            ctx.session.account!.username,
            input.id_proyek
          )
      ),
    deleteProyek: this.trpc.guruProcedure
      .input(proyekIdSchema)
      .mutation(async ({ input, ctx }) => {
        await this.service.deleteProyek(
          ctx.session.account!.username,
          input.id_proyek
        );
        return true;
      }),
    getCatatanProsesProyek: this.trpc.guruProcedure
      .input(proyekIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getCatatanProsesProyek(
            ctx.session.account!.username,
            input.id_proyek
          )
      ),
    updateCatatanProsesProyek: this.trpc.guruProcedure
      .input(
        proyekIdSchema.extend({
          catatan: z.array(
            z.object({
              id_siswa: z.string().uuid(),
              catatan_proses: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await this.service.updateCatatanProsesProyek(
          ctx.session.account!.username,
          input.id_proyek,
          input.catatan
        );
        return true;
      }),
    getAllTarget: this.trpc.guruProcedure
      .input(proyekIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getAllTarget(
            ctx.session.account!.username,
            input.id_proyek
          )
      ),
    addTarget: this.trpc.guruProcedure
      .input(proyekIdSchema.extend(targetSchema.shape))
      .mutation(
        async ({ input, ctx }) =>
          await this.service.addTarget(
            ctx.session.account!.username,
            input.id_proyek,
            extractFields(targetSchema, input)
          )
      ),
    updateTarget: this.trpc.guruProcedure
      .input(targetIdSchema.extend(targetSchema.shape))
      .mutation(async ({ input, ctx }) => {
        await this.service.updateTarget(
          ctx.session.account!.username,
          input.id_target,
          extractFields(targetSchema, input)
        );
        return true;
      }),
    deleteTarget: this.trpc.guruProcedure
      .input(targetIdSchema)
      .mutation(async ({ input, ctx }) => {
        await this.service.deleteTarget(
          ctx.session.account!.username,
          input.id_target
        );
        return true;
      }),
    getTarget: this.trpc.guruProcedure
      .input(targetIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getTarget(
            ctx.session.account!.username,
            input.id_target
          )
      ),
    getNilaiTarget: this.trpc.guruProcedure
      .input(targetIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getNilaiTarget(
            ctx.session.account!.username,
            input.id_target
          )
      ),
    updateNilaiTarget: this.trpc.guruProcedure
      .input(
        targetIdSchema.extend({
          nilai: z.array(
            z.object({
              id_siswa: z.string().uuid(),
              nilai: z.enum([
                'MULAI_BERKEMBANG',
                'SEDANG_BERKEMBANG',
                'BERKEMBANG_SESUAI_HARAPAN',
                'SANGAT_BERKEMBANG',
              ]).optional(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await this.service.updateNilaiTarget(
          ctx.session.account!.username,
          input.id_target,
          input.nilai
        );
        return true;
      }),
  });
}
