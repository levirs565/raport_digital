import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { PrismaHelper } from '../../utils';

@Injectable()
export class OperatorMataPelajaranService {
  constructor(private readonly prismaClient: PrismaService) {}

  async getAll(periodeAjarId: string) {
    return await this.prismaClient.mata_Pelajaran.findMany({
      where: {
        id_periode_ajar: periodeAjarId,
      },
      orderBy: [
        {
          kelompok_mapel: 'asc',
        },
        {
          nama: 'asc',
        },
      ],
    });
  }

  async get(id: string) {
    const result = await this.prismaClient.mata_Pelajaran.findUnique({
      where: {
        id_mata_pelajaran: id,
      },
      include: {
        Guru_Mata_Pelajaran: {
          select: {
            Guru: {
              select: {
                nama_lengkap: true,
                NIP: true,
                username: true,
              },
            },
          },
        },
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Mata pelajaran not found',
      });

    const { Guru_Mata_Pelajaran, ...rest } = result;
    return {
      guru: Guru_Mata_Pelajaran.map((item) => item.Guru),
      ...rest,
    };
  }

  async add(
    periodeAjarId: string,
    name: string,
    kelompok: string | null,
    usernameGuruPengampu: string[]
  ) {
    const result = await this.prismaClient.mata_Pelajaran.create({
      data: {
        id_periode_ajar: periodeAjarId,
        nama: name,
        kelompok_mapel: kelompok,
        Guru_Mata_Pelajaran: {
          create: usernameGuruPengampu.map((username) => ({
            username_guru: username,
          })),
        },
      },
    });
    return result.id_mata_pelajaran;
  }

  async update(
    mapelId: string,
    name: string,
    kelompok: string | null,
    usernameGuruPengampu: string[]
  ) {
    try {
      await this.prismaClient.mata_Pelajaran.update({
        where: {
          id_mata_pelajaran: mapelId,
        },
        data: {
          nama: name,
          kelompok_mapel: kelompok,
          Guru_Mata_Pelajaran: {
            deleteMany: {
              username_guru: {
                notIn: usernameGuruPengampu
              }
            },
            upsert: usernameGuruPengampu.map((item) => ({
              where: {
                id_mata_pelajaran_username_guru: {
                  id_mata_pelajaran: mapelId,
                  username_guru: item
                }
              },
              create: {
                username_guru: item,
              },
              update: {}
            })),
          },
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Mata pelajaran not found',
        });
      } else throw e;
    }
  }
}
