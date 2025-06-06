import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { KepalaSekolahService } from './kepala-sekolah.service';
import z from 'zod';
import { periodeAjarIdSchema } from '../common';

const kelasIdSchema = z.object({
  kelas_id: z.string().uuid(),
});

const siswaKelasIdSchema = kelasIdSchema.extend({
  siswa_id: z.string().uuid(),
});

const raportVerifyStateSchema = z.discriminatedUnion('is_verified', [
  z.object({
    is_verified: z.literal(true),
  }),
  z.object({
    is_verified: z.literal(false),
    reason: z.string(),
  }),
]);

@Injectable()
export class KepalaSekolahRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly service: KepalaSekolahService
  ) {}

  router = this.trpc.router({
    getAllKelas: this.trpc.kepalaSekolahProcedure
      .input(periodeAjarIdSchema)
      .query(
        async ({ input }) =>
          await this.service.getAllKelas(input.periode_ajar_id)
      ),
    getKelas: this.trpc.kepalaSekolahProcedure
      .input(kelasIdSchema)
      .query(async ({ input }) => await this.service.getKelas(input.kelas_id)),
    getAllAnggotaKelas: this.trpc.kepalaSekolahProcedure
      .input(kelasIdSchema)
      .query(
        async ({ input }) =>
          await this.service.getAllAnggotaKelas(input.kelas_id)
      ),
    getAnggotaKelas: this.trpc.kepalaSekolahProcedure
      .input(siswaKelasIdSchema)
      .query(
        async ({ input }) =>
          await this.service.getAnggotaKelas(input.kelas_id, input.siswa_id)
      ),
    getRaportPDF: this.trpc.kepalaSekolahProcedure
      .input(siswaKelasIdSchema)
      .query(
        async ({ input }) =>
          await this.service.getRaportPDF(input.kelas_id, input.siswa_id)
      ),
    verifyRaport: this.trpc.kepalaSekolahProcedure
      .input(
        siswaKelasIdSchema.extend({
          status: raportVerifyStateSchema,
        })
      )
      .mutation(async ({ input }) => {
        await this.service.verifyRaport(
          input.kelas_id,
          input.siswa_id,
          input.status
        );
        return true;
      }),
    unlockRaport: this.trpc.kepalaSekolahProcedure
      .input(siswaKelasIdSchema)
      .mutation(async ({ input }) => {
        await this.service.unlockRaport(input.kelas_id, input.siswa_id);
        return true;
      }),
  });
}
