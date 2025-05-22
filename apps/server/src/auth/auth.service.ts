import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import * as argon2 from 'argon2';
import { AccountData } from '../types';

type LoginResult =
  | {
      state: 'PENDING_VERIFICATION';
    }
  | ({
      state: 'SUCCESS';
    } & AccountData);

@Injectable()
export class AuthService {
  constructor(private readonly prismaClient: PrismaService) {}

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
}
