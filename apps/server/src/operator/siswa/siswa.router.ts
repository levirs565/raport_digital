import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import { OperatorSiswaService } from './siswa.service';
import z from 'zod';

const siswaSchema = z.object({
  NIS: z.string(),
  NISN: z.string(),
  nama: z.string(),
  jenis_kelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  tempat_lahir: z.string(),
  tgl_lahir: z.date(),
  alamat: z.string(),
  agama: z.string(),
  status_dlm_keluarga: z.string(),
  anak_ke: z.number(),
  no_telp: z.string(),
  sekolah_asal: z.string(),
  tgl_diterima: z.date(),
  tingkat_diterima: z.number(),
  nama_ayah: z.string(),
  nama_ibu: z.string(),
  pekerjaan_ayah: z.string(),
  pekerjaan_ibu: z.string(),
  alamat_ortu: z.string(),
  nama_wali: z.string(),
  pekerjaan_wali: z.string(),
  alamat_wali: z.string(),
});

@Injectable()
export class OperatorSiswaRouter {
  constructor(
    private readonly service: OperatorSiswaService,
    private readonly trpc: TrpcService
  ) {}

  router = this.trpc.router({
    getAll: this.trpc.operatorProcedure
      .input(
        z.object({
          page_index: z.number(),
          order_by: z.enum(['NIS', 'Nama']),
          asc: z.boolean(),
          filter: z.string().optional(),
        })
      )
      .query(
        async ({ input }) =>
          await this.service.getAll(input.page_index, input.order_by, input.asc, input.filter)
      ),
    count: this.trpc.operatorProcedure.query(
      async () => await this.service.count()
    ),
    get: this.trpc.operatorProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => await this.service.get(input.id)),
    add: this.trpc.operatorProcedure
      .input(siswaSchema)
      .mutation(async ({ input }) => await this.service.add(input)),
    importCsv: this.trpc.operatorProcedure
      .input(this.trpc.octetInputParse)
      .mutation(async ({ input }) => await this.service.importCsv(input)),
    update: this.trpc.operatorProcedure
      .input(
        siswaSchema.extend({
          id_siswa: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await this.service.update(input);
        return true;
      }),
  });
}
