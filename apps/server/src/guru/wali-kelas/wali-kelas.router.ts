import { Injectable } from '@nestjs/common';
import { GuruWaliKelasService } from './wali-kelas.service';
import { TrpcService } from '../../trpc/trpc.service';
import { periodeAjarIdSchema } from '../../common';
import z from 'zod';
import { extractFields } from '../../utils';

const idSchema = z.object({
  kelas_id: z.string().uuid(),
});

const siswaIdSchema = idSchema.extend({
  siswa_id: z.string().uuid(),
});

const prestasiId = z.object({
  prestasi_id: z.string().uuid(),
});

const kehadiranSchema = z.object({
  sakit_hari: z.number(),
  izin_hari: z.number(),
  alpa_hari: z.number(),
});

const prestasiSchema = z.object({
  jenis: z.string(),
  keterangan: z.string(),
});

@Injectable()
export class GuruWaliKelasRouter {
  constructor(
    private readonly service: GuruWaliKelasService,
    private readonly trpc: TrpcService
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
          await this.service.get(ctx.session.account!.username, input.kelas_id)
      ),
    getAllAnggota: this.trpc.guruProcedure
      .input(idSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getAllAnggota(
            ctx.session.account!.username,
            input.kelas_id
          )
      ),
    getAnggota: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getAnggota(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    getRekapNilai: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getRekapNilai(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    getRaportPDF: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getRaportPDF(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    getRaportStatus: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getRaportStatus(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    getKehadiran: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getKehadiran(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    updateKehadiran: this.trpc.guruProcedure
      .input(siswaIdSchema.extend(kehadiranSchema.shape))
      .mutation(async ({ input, ctx }) => {
        await this.service.updateKehadiran(
          ctx.session.account!.username,
          input.kelas_id,
          input.siswa_id,
          extractFields(kehadiranSchema, input)
        );
        return true;
      }),
    getCatatanWaliKelas: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getCatatanWaliKelas(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    updateCatatanWaliKelas: this.trpc.guruProcedure
      .input(
        siswaIdSchema.extend({
          catatan: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await this.service.updateCatatanWaliKelas(
          ctx.session.account!.username,
          input.kelas_id,
          input.siswa_id,
          input.catatan
        );
        return true;
      }),
    getAllPrestasi: this.trpc.guruProcedure
      .input(siswaIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getAllPrestasi(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id
          )
      ),
    getPrestasi: this.trpc.guruProcedure
      .input(idSchema.extend(prestasiId.shape))
      .query(
        async ({ input, ctx }) =>
          await this.service.getPrestasi(
            ctx.session.account!.username,
            input.kelas_id,
            input.prestasi_id
          )
      ),
    addPrestasi: this.trpc.guruProcedure
      .input(siswaIdSchema.extend(prestasiSchema.shape))
      .mutation(
        async ({ input, ctx }) =>
          await this.service.addPrestasi(
            ctx.session.account!.username,
            input.kelas_id,
            input.siswa_id,
            extractFields(prestasiSchema, input)
          )
      ),
    updatePrestasi: this.trpc.guruProcedure
      .input(idSchema.extend(prestasiId.shape).extend(prestasiSchema.shape))
      .mutation(async ({ input, ctx }) => {
        await this.service.updatePrestasi(
          ctx.session.account!.username,
          input.kelas_id,
          input.prestasi_id,
          extractFields(prestasiSchema, input)
        );
        return true;
      }),
    deletePrestasi: this.trpc.guruProcedure
      .input(idSchema.extend(prestasiId.shape))
      .mutation(async ({ input, ctx }) => {
        await this.service.deletePrestasi(
          ctx.session.account!.username,
          input.kelas_id,
          input.prestasi_id
        );
        return true;
      }),
  });
}
