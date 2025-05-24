import { Injectable } from '@nestjs/common';
import { TrpcService } from '../../trpc/trpc.service';
import {
  GuruMataPelajaranService,
  MataPelajaranKelasID,
} from './mata-pelajaran.service';
import { periodeAjarIdSchema } from '../../common';
import z from 'zod';

const idSchema = z.object({
  id_kelas: z.string().uuid(),
  id_mata_pelajaran: z.string().uuid(),
});

const materiIdSchema = z.object({
  id: z.string().uuid(),
});

const materiSchema = {
  nama: z.string(),
  detail: z.string(),
};

@Injectable()
export class GuruMataPelajaranRouter {
  constructor(
    private readonly trpc: TrpcService,
    private readonly service: GuruMataPelajaranService
  ) {}

  private extractId({
    id_kelas,
    id_mata_pelajaran,
  }: z.infer<typeof idSchema>): MataPelajaranKelasID {
    return {
      id_kelas,
      id_mata_pelajaran,
    };
  }

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
          await this.service.get(
            ctx.session.account!.username,
            this.extractId(input)
          )
      ),
    getMateriList: this.trpc.guruProcedure
      .input(idSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getMateriList(
            ctx.session.account!.username,
            this.extractId(input)
          )
      ),
    addMateri: this.trpc.guruProcedure
      .input(idSchema.extend(materiSchema))
      .mutation(
        async ({ input, ctx }) =>
          await this.service.addMateri(
            ctx.session.account!.username,
            this.extractId(input),
            input.nama,
            input.detail
          )
      ),
    getMateri: this.trpc.guruProcedure
      .input(materiIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getMateri(
            ctx.session.account!.username,
            input.id
          )
      ),
    updateMateri: this.trpc.guruProcedure
      .input(materiIdSchema.extend(materiSchema))
      .mutation(async ({ input, ctx }) => {
        await this.service.updateMateri(
          ctx.session.account!.username,
          input.id,
          input.nama,
          input.detail
        );
        return true;
      }),
    deleteMateri: this.trpc.guruProcedure
      .input(materiIdSchema)
      .mutation(async ({ input, ctx }) => {
        await this.service.deleteMateri(
          ctx.session.account!.username,
          input.id
        );
        return true;
      }),
    getNilaiMateri: this.trpc.guruProcedure
      .input(materiIdSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getNilaiMateri(
            ctx.session.account!.username,
            input.id
          )
      ),
    updateNilaiMateri: this.trpc.guruProcedure
      .input(
        materiIdSchema.extend({
          nilai: z.array(
            z.object({
              id_siswa: z.string(),
              nilai: z.number(),
            })
          ),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await this.service.updateNilaiMateri(
          ctx.session.account!.username,
          input.id,
          input.nilai
        );
        return true;
      }),
    getTotalNilai: this.trpc.guruProcedure
      .input(idSchema)
      .query(
        async ({ input, ctx }) =>
          await this.service.getTotalNilai(
            ctx.session.account!.username,
            this.extractId(input)
          )
      ),
  });
}
