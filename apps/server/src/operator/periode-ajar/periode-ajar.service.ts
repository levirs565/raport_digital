import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TRPCError } from "@trpc/server";
import { $Enums, Periode_Ajar, Prisma } from "@prisma/client";

@Injectable()
export class OperatorPeriodeAjarService {
    constructor(
        private readonly prismaClient: PrismaService
    ) { }

    async getAll() {
        return this.prismaClient.periode_Ajar.findMany({
            orderBy: [
                {
                    tahunAjar: 'desc'
                },
                {
                    semester: 'desc'
                }
            ]
        })
    }

    private ensureFound(ajar: Periode_Ajar | null) {
        if (!ajar) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Periode ajar not found"
        })
    }

    async get(id: string) {
        const result = await this.prismaClient.periode_Ajar.findUnique({
            where: {
                id_periode_ajar: id
            }
        })
        this.ensureFound(result);
        return result
    }

    async add(tahunAjar: number, semester: $Enums.Semester) {
        const result = await this.prismaClient.periode_Ajar.create({
            data: {
                tahunAjar,
                semester
            }
        })

        return result.id_periode_ajar
    }

    async update(id: string, tahunAjar: number, semester: $Enums.Semester) {
        try {
            await this.prismaClient.periode_Ajar.update({
                where: {
                    id_periode_ajar: id
                },
                data: {
                    tahunAjar,
                    semester
                }
            })
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code == "P2025") {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Periode ajar not found"
                })
            } else throw e
        }
    }
}