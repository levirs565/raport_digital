import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TRPCError } from "@trpc/server";
import { Siswa } from "@prisma/client";
import { PrismaHelper } from "../../utils";

export type SiswaOrderBy = "NIS" | "Nama"

@Injectable()
export class OperatorSiswaService {
    constructor(
        private readonly prismaClient: PrismaService
    ) {}

    private pageSize = 20
    async getAll(pageIndex: number, orderBy: SiswaOrderBy, asc: boolean) {
        const count = await this.prismaClient.siswa.count();
        const result = await this.prismaClient.siswa.findMany({
            skip: pageIndex * this.pageSize,
            take: this.pageSize,
            orderBy: [
                orderBy == "NIS" ? {
                    NIS: asc ? "asc" : "desc"
                } : {
                    nama: asc ? "asc" : "desc"
                }
            ],
            select: {
                id_siswa: true,
                nama: true,
                NIS: true,
                NISN: true
            }
        })

        return {
            page_index: pageIndex,
            page_count: Math.ceil(count / this.pageSize),
            page: result
        }
    }

    async get(id: string) {
        const result = await this.prismaClient.siswa.findUnique({
            where: {
                id_siswa: id
            }
        })
        if (!result) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Siswa not found"
        })
        return result
    }

    async add(data: Omit<Siswa, "id_siswa">) {
        const result = await this.prismaClient.siswa.create({
            data
        })

        return result.id_siswa
    }

    async update({ id_siswa, ...data}: Siswa) {
        try {
            await this.prismaClient.siswa.update({
                data,
                where: {
                    id_siswa
                }
            })
        } catch (e) {
            if (PrismaHelper.isRecordNotFoundError(e)) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Siswa not found"
                })
            } else throw e
        }
    }
}