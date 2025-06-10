import { Injectable } from '@nestjs/common';
import { OperatorMataPelajaranService } from './mata_pelajaran.service';
import { TrpcService } from '../../trpc/trpc.service';
import z from 'zod';

const baseInputSchema = z.object({
  periodeAjarId: z.string(),
});

const baseWriteSchema = {
  name: z.string(),
  kelompok: z.string().optional(),
  guruPengampu: z.array(z.string()),
};

@Injectable()
export class OperatorMataPelajaranRouter {
  constructor(
    private readonly service: OperatorMataPelajaranService,
    private readonly trpc: TrpcService
  ) {}

  router = this.trpc.router({
    count: this.trpc.operatorProcedure
      .input(baseInputSchema)
      .query(({ input }) => this.service.count(input.periodeAjarId)),
    getAll: this.trpc.operatorProcedure
      .input(baseInputSchema)
      .query(({ input }) => this.service.getAll(input.periodeAjarId)),
    get: this.trpc.operatorProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => this.service.get(input.id)),
    delete: this.trpc.operatorProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await this.service.delete(input.id);
        return true;
      }),
    add: this.trpc.operatorProcedure
      .input(baseInputSchema.extend(baseWriteSchema))
      .mutation(({ input }) =>
        this.service.add(
          input.periodeAjarId,
          input.name,
          input.kelompok ?? null,
          input.guruPengampu
        )
      ),
    update: this.trpc.operatorProcedure
      .input(
        z
          .object({
            id: z.string(),
          })
          .extend(baseWriteSchema)
      )
      .mutation(async ({ input }) => {
        await this.service.update(
          input.id,
          input.name,
          input.kelompok ?? null,
          input.guruPengampu
        );
        return true;
      }),
  });
}
