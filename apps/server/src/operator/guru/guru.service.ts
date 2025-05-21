import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';

@Injectable()
export class OperatorGuruService {
  constructor(private readonly prismaClient: PrismaService) {}

  async getVerifiedAll() {
    return this.prismaClient.guru.findMany({
      where: {
        is_verified: true,
      },
      omit: {
        is_verified: true,
        tanda_tangan: true,
      },
    });
  }

  async getUnverifiedAll() {
    return this.prismaClient.guru.findMany({
      where: {
        is_verified: false,
      },
      omit: {
        is_verified: true,
        tanda_tangan: true,
      },
    });
  }

  async verify(username: string, accept: boolean) {
    const guru = await this.prismaClient.guru.findUnique({
      where: {
        username,
      },
      select: {
        is_verified: true,
      },
    });

    if (!guru)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Guru is not found',
      });

    if (guru.is_verified)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Guru has been verified',
      });

    if (accept) {
      await this.prismaClient.guru.update({
        where: {
          username,
        },
        data: {
          is_verified: true,
        },
      });
    } else {
      await this.prismaClient.$transaction([
        this.prismaClient.guru.delete({
          where: {
            username,
          },
        }),
        this.prismaClient.akun.delete({
          where: {
            username,
          },
        }),
      ]);
    }
  }
}
