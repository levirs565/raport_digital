import { Injectable } from "@nestjs/common";
import { TrpcService } from "../../trpc/trpc.service";
import { GuruEkstrakurikulerService } from "./ekstrakurikuler.service";
import { periodeAjarIdSchema } from "../../common";
import z from "zod";

const idSchema = z.object({
  id: z.string().uuid()
})

@Injectable()
export class GuruEkstrakurikulerRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly service: GuruEkstrakurikulerService
  ) { }

  router = this.trpc.router({
    getAll: this.trpc.guruProcedure
      .input(periodeAjarIdSchema)
      .query(async ({ input, ctx }) => await this.service.getAll(ctx.session.account!.username, input.periode_ajar_id)),
    get: this.trpc.guruProcedure
      .input(idSchema)
      .query(async ({ input, ctx }) => await this.service.get(ctx.session.account!.username, input.id)),
    getAnggotaList: this.trpc.guruProcedure
      .input(idSchema)
      .query(async ({ input, ctx }) => await this.service.getAnggotaList(ctx.session.account!.username, input.id)),
    updateAnggotaList: this.trpc.guruProcedure
      .input(idSchema.extend({
        id_siswa_list: z.array(z.string().uuid()),
      }))
      .mutation(async ({ input, ctx }) => {
        await this.service.updateAnggotaList(ctx.session!.account!.username, input.id, input.id_siswa_list)
        return true;
      }),
    updateNilai: this.trpc.guruProcedure
      .input(idSchema.extend({
        nilai: z.array(z.object({
          id_siswa: z.string().uuid(),
          nilai: z.enum(["SANGAT_BAIK", "BAIK", "CUKUP", "KURANG"]).optional(),
          keterangan: z.string().optional()
        }))
      }))
      .mutation(async ({ input, ctx }) => {
        await this.service.updateNilai(ctx.session!.account!.username, input.id, input.nilai)
        return true;
      })
  })
}
