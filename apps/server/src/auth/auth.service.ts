import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TRPCError } from "@trpc/server";
import * as argon2 from "argon2";
import { AccountData } from "../session";

type LoginResult = {
    state: "PENDING_VERIFICATION"
} | ({
    state: "SUCCESS",
} & AccountData)

@Injectable()
export class AuthService {
    constructor(private readonly prismaClient: PrismaService) { }

    async login(username: string, password: string): Promise<LoginResult> {
        const account = await this.prismaClient.akun.findUnique({
            where: {
                username,
            }
        })

        if (!account || await argon2.verify(account.password_hash, password)) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Invalid username ord passsword"
            })
        }

        if (account.type == "GURU") {
            const guru = await this.prismaClient.guru.findUnique({
                where: {
                    username
                },
                select: {
                    is_verified: true
                }
            })
            if (!guru?.is_verified)
                return {
                    state: "PENDING_VERIFICATION",
                }
        }

        return {
            state: "SUCCESS",
            username,
            type: account.type
        }
    }

    async hashPassword(password: string): Promise<string> {
        return argon2.hash(password);
    }

    async createOperatorAccount(username: string, password: string) {
        return await this.prismaClient.akun.create({
            data: {
                username,
                password_hash: await this.hashPassword(password),
                type: "OPERATOR"
            }
        })
    }

    async createKepalaSekolahAccount(username: string, passsword: string, nama: string) {
        return await this.prismaClient.akun.create({
            data: {
                username,
                password_hash: await this.hashPassword(passsword),
                type: "KEPALA_SEKOLAH",
                KepalaSekolah: {
                    create: {
                        nama_lengkap: nama
                    }
                }
            }
        })
    }

    async createGuruAccount(username: string, passsword: string, nama: string) {
        await this.prismaClient.akun.create({
            data: {
                username,
                password_hash: await this.hashPassword(passsword),
                type: "GURU",
                Guru: {
                    create: {
                        nama_lengkap: nama,
                        is_verified: false,
                    }
                }
            }
        })
    }
}