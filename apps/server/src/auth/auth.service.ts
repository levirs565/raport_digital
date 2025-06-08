import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import * as argon2 from 'argon2';
import { AccountData } from '../types';
import { TandaTanganService } from '../tanda-tangan/tanda-tangan.service';
import { ReadableStream } from 'node:stream/web';
import { Readable } from 'node:stream';
import { $Enums } from '@prisma/client';

type LoginResult =
  | {
      state: 'PENDING_VERIFICATION';
    }
  | ({
      state: 'SUCCESS';
    } & AccountData);

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly tandaTanganService: TandaTanganService
  ) {}

  private async verifyPassword(hash: string, password: string) {
    return argon2.verify(hash, password);
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const account = await this.prismaClient.akun.findUnique({
      where: {
        username,
      },
    });

    if (
      !account ||
      !(await this.verifyPassword(account.password_hash, password))
    ) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Invalid username or passsword',
      });
    }

    let name: string | undefined = undefined;
    if (account.type == 'GURU') {
      const guru = await this.prismaClient.guru.findUnique({
        where: {
          username,
        },
        select: {
          is_verified: true,
          nama_lengkap: true,
        },
      });
      if (!guru?.is_verified)
        return {
          state: 'PENDING_VERIFICATION',
        };

      name = guru?.nama_lengkap;
    } else if (account.type == 'KEPALA_SEKOLAH') {
      const kepalaSekolah = await this.prismaClient.kepala_Sekolah.findUnique({
        where: {
          username,
        },
        select: {
          nama_lengkap: true,
        },
      });
      name = kepalaSekolah?.nama_lengkap;
    }

    return {
      state: 'SUCCESS',
      username,
      type: account.type,
      namaLengkap: name,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
  }

  private async ensureUserNameAvailable(username: string) {
    if (
      (await this.prismaClient.akun.count({
        where: {
          username,
        },
      })) > 0
    ) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Username not available',
      });
    }
  }

  async createOperatorAccount(username: string, password: string) {
    await this.ensureUserNameAvailable(username);
    await this.prismaClient.akun.create({
      data: {
        username,
        password_hash: await this.hashPassword(password),
        type: 'OPERATOR',
      },
    });
  }

  async createKepalaSekolahAccount(
    username: string,
    passsword: string,
    nama: string
  ) {
    await this.ensureUserNameAvailable(username);
    await this.prismaClient.akun.create({
      data: {
        username,
        password_hash: await this.hashPassword(passsword),
        type: 'KEPALA_SEKOLAH',
        KepalaSekolah: {
          create: {
            nama_lengkap: nama,
          },
        },
      },
    });
  }

  async createGuruAccount(username: string, passsword: string, nama: string) {
    await this.ensureUserNameAvailable(username);
    await this.prismaClient.akun.create({
      data: {
        username,
        password_hash: await this.hashPassword(passsword),
        type: 'GURU',
        Guru: {
          create: {
            nama_lengkap: nama,
            is_verified: false,
          },
        },
      },
    });
  }

  async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string
  ) {
    const account = await this.prismaClient.akun.findUnique({
      where: {
        username,
      },
      select: {
        password_hash: true,
      },
    });

    if (!(await this.verifyPassword(account!.password_hash, oldPassword))) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Password not match',
      });
    }

    await this.prismaClient.akun.update({
      where: {
        username,
      },
      data: {
        password_hash: await this.hashPassword(newPassword),
      },
    });
  }

  async getTandaTangan(username: string) {
    return (await this.tandaTanganService.get(username))?.toString('base64') ?? null;
  }

  async updateTandaTangan(username: string, stream: ReadableStream) {
    await this.tandaTanganService.set(username, Readable.fromWeb(stream));
  }

  async getProfile(username: string) {
    const akun = await this.prismaClient.akun.findUnique({
      where: {
        username,
      },
      select: {
        type: true,
        Guru: {
          select: {
            nama_lengkap: true,
            NIP: true,
          },
        },
        KepalaSekolah: {
          select: {
            nama_lengkap: true,
            NIP: true,
          },
        },
      },
    });
    if (!akun)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Akun is not found',
      });

    if (akun.type == 'GURU') return { type: akun.type, ...akun.Guru! };
    if (akun.type == 'KEPALA_SEKOLAH')
      return { type: akun.type, ...akun.KepalaSekolah! };
    return { type: akun.type };
  }

  async updateProfile(
    username: string,
    role: $Enums.AkunType,
    data: { nama_lengkap: string; NIP: string | null }
  ) {
    if (role == 'KEPALA_SEKOLAH')
      await this.prismaClient.kepala_Sekolah.update({
        where: {
          username,
        },
        data,
      });
    else if (role == 'GURU')
      await this.prismaClient.guru.update({
        where: {
          username,
        },
        data,
      });
  }
}
