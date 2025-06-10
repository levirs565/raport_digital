import { Injectable } from '@nestjs/common';
import { OperatorEkstrakurikulerService } from './ekstrakurikuler.service';
import { TrpcService } from '../../trpc/trpc.service';
import z from 'zod';

const baseInputSchema = z.object({
  periodeAjarId: z.string(),
});

const baseWriteSchema = {
  nama: z.string(),
  usernameGuru: z.string(),
};

@Injectable()
export class OperatorEkstrakurikulerRouter {
  constructor(
    private readonly service: OperatorEkstrakurikulerService,
    private readonly trpc: TrpcService
  ) {}

  router = this.trpc.router({
    count: this.trpc.operatorProcedure
      .input(baseInputSchema)
      .query(
        async ({ input }) => await this.service.count(input.periodeAjarId)
      ),
    getAll: this.trpc.operatorProcedure
      .input(baseInputSchema)
      .query(
        async ({ input }) => await this.service.getAll(input.periodeAjarId)
      ),
    get: this.trpc.operatorProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => await this.service.get(input.id)),
    add: this.trpc.operatorProcedure
      .input(baseInputSchema.extend(baseWriteSchema))
      .mutation(
        async ({ input }) =>
          await this.service.add(
            input.periodeAjarId,
            input.nama,
            input.usernameGuru
          )
      ),
    update: this.trpc.operatorProcedure
      .input(z.object({ id: z.string() }).extend(baseWriteSchema))
      .mutation(async ({ input }) => {
        await this.service.update(input.id, input.nama, input.usernameGuru);
        return true;
      }),
  });
}
