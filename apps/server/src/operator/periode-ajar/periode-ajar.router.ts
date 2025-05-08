import { Injectable } from "@nestjs/common";
import { TrpcService } from "../../trpc/trpc.service";
import { OperatorPeriodeAjarService } from "./periode-ajar.service";
import z from "zod";

const periodeAjarSchema = z.object({
    tahunAjar: z.number(),
    semester: z.enum(["GANJIL", "GENAP"])
})

@Injectable()
export class OperatorPeriodeAjarRouter {
    constructor(
        private readonly service: OperatorPeriodeAjarService,
        private readonly trpc: TrpcService
    ) { }


    router = this.trpc.router({
        getAll: this.trpc.operatorProcedure
            .query(async () => this.service.getAll()),
        get: this.trpc.operatorProcedure
            .input(z.string())
            .query(async ({ input }) => this.service.get(input)),
        add: this.trpc.operatorProcedure
            .input(periodeAjarSchema)
            .mutation(async ({ input }) => this.service.add(input.tahunAjar, input.semester)),
        update: this.trpc.operatorProcedure
            .input(periodeAjarSchema.extend({
                id: z.string()
            }))
            .mutation(async ({ input }) => {
                await this.service.update(input.id, input.tahunAjar, input.semester);
                return true;
            })
    })
}