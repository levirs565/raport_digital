import { Injectable } from "@nestjs/common";
import { TrpcService } from "../../trpc/trpc.service";
import { OperatorKelasService } from "./kelas.service";
import { periodeAjarIdSchema } from "../common";
import z from "zod";

const idSchema = z.object({
  id: z.string().uuid()
})

const baseWriteSchema = {
  kelas: z.number(),
  kode_ruang_kelas: z.string(),
  username_wali_kelas: z.string(),
  username_koor_p5: z.string()
}



const baseMataPelajaranSchema = idSchema.extend({
  id_mata_pelajaran: z.string(),
})

const mataPelajaranSchema = baseMataPelajaranSchema.extend({
  username_guru: z.string()
})

@Injectable()
export class OperatorKelasRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly service: OperatorKelasService
  ) { }

  router = this.trpc.router({
    getAll: this.trpc.operatorProcedure
      .input(periodeAjarIdSchema)
      .query(async ({ input }) => await this.service.getAll(input.periode_ajar_id)),
    get: this.trpc.operatorProcedure
      .input(idSchema)
      .query(async ({ input }) => await this.service.get(input.id)),
    add: this.trpc.operatorProcedure
      .input(periodeAjarIdSchema.extend(baseWriteSchema))
      .mutation(async ({ input }) => await this.service.add(
        input.periode_ajar_id, input.kelas, input.kode_ruang_kelas,
        input.username_wali_kelas, input.username_koor_p5
      )),
    update: this.trpc.operatorProcedure
      .input(idSchema.extend(baseWriteSchema))
      .mutation(async ({ input }) => {
        await this.service.update(
          input.id, input.kelas, input.kode_ruang_kelas,
          input.username_wali_kelas, input.username_wali_kelas
        )
        return true;
      }),
    getMataPelajaranList: this.trpc.operatorProcedure
      .input(idSchema)
      .query(async ({ input }) => await this.service.getMataPelajaranList(input.id)),
    addMataPelajaran: this.trpc.operatorProcedure
      .input(mataPelajaranSchema)
      .mutation(async ({ input }) => {
        await this.service.addMataPelajaran(
          input.id,
          input.id_mata_pelajaran,
          input.username_guru
        )
        return true
      }),
    deleteMataPelajaran: this.trpc.operatorProcedure
      .input(baseMataPelajaranSchema)
      .mutation(async ({ input }) => {
        await this.service.deleteMataPelajaran(input.id, input.id_mata_pelajaran);
        return true;
      }),
    getAnggotaList: this.trpc.operatorProcedure
      .input(idSchema)
      .query(async ({ input }) => await this.service.getAnggotaList(input.id)),
    updateAnggotaList: this.trpc.operatorProcedure
      .input(idSchema.extend({
        id_siswa_list: z.array(z.string())
      }))
      .mutation(async ({ input }) => {
        await this.service.updateAnggotaList(input.id, input.id_siswa_list);
        return true;
      }),
    deleteAnggota: this.trpc.operatorProcedure
      .input(idSchema.extend({
        id_siswa: z.string()
      }))
      .mutation(async ({ input }) => {
        await this.service.deleteAnggota(input.id, input.id_siswa);
        return true;
      }),
    delete: this.trpc.operatorProcedure
      .input(idSchema)
      .mutation(async ({ input }) => {
        await this.service.delete(input.id);
        return true;
      })
  })
}
