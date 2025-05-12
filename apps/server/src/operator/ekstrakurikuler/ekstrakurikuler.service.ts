import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TRPCError } from "@trpc/server";
import { PrismaHelper } from "../../utils";

@Injectable()
export class OperatorEkstrakurikulerService {
    constructor(
        private readonly prismaClient: PrismaService
    ) { }

    async getAll(periodeAjarId: string) {
        const result = await this.prismaClient.ekstrakurikuler.findMany({
            where: {
                id_periode_ajar: periodeAjarId
            },
            orderBy: [
                {
                    nama: 'asc'
                }
            ],
            include: {
                Guru: {
                    select: {
                        nama_lengkap: true
                    }
                }
            }
        });
        return result.map(({ Guru, username_guru, ...rest }) => ({
            guru: {
                username: username_guru,
                nama_lengkap: Guru.nama_lengkap,
            },
            ...rest
        }))
    }

    async get(id: string) {
        const result = await this.prismaClient.ekstrakurikuler.findUnique({
            where: {
                id_esktrakurikuler: id
            },
            include: {
                Guru: {
                    select: {
                        nama_lengkap: true,
                        NIP: true
                    }
                }
            }
        })

        if (!result) throw new TRPCError({
            code: "NOT_FOUND",
            message: "Ekstrakurikuler not found"
        })

        const { Guru, username_guru, ...rest } = result;
        return {
            guru: {
                username: username_guru,
                ...Guru
            },
            ...rest
        }
    }

    async add(periodeAjarId: string, nama: string, usernameGuru: string) {
        const result = await this.prismaClient.ekstrakurikuler.create({
            data: {
                nama,
                id_periode_ajar: periodeAjarId,
                username_guru: usernameGuru
            }
        })
        return result.id_esktrakurikuler
    }

    async update(id: string, nama: string, usernameGuru: string) {
        try {
            await this.prismaClient.ekstrakurikuler.update({
                data: {
                    nama,
                    username_guru: usernameGuru
                },
                where: {
                    id_esktrakurikuler: id
                }
            })
        } catch (e) {
            if (PrismaHelper.isRecordNotFoundError(e)) throw new TRPCError({
                code: "NOT_FOUND",
                message: "Ekstrakurikuler not found"
            })
            else throw e
        }
    }
}