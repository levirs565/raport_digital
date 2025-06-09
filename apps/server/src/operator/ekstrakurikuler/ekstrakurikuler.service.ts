import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { PrismaHelper } from '../../utils';
import { CommonUtilsService } from '../../common/common.utils.service';

@Injectable()
export class OperatorEkstrakurikulerService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly commonUtilsService: CommonUtilsService
  ) {}

  async getAll(periodeAjarId: string) {
    const result = await this.prismaClient.ekstrakurikuler.findMany({
      where: {
        id_periode_ajar: periodeAjarId,
      },
      orderBy: [
        {
          nama: 'asc',
        },
      ],
      include: {
        _count: {
          select: {
            Anggota_Ekstrakurikuler: {
              where: {
                Siswa:
                  this.commonUtilsService.createSiswaLockedSelector(
                    periodeAjarId
                  ),
              },
            },
          },
        },
        Guru: {
          select: {
            nama_lengkap: true,
          },
        },
      },
    });
    return result.map(({ Guru, username_guru, _count, ...rest }) => ({
      guru: {
        username: username_guru,
        nama_lengkap: Guru.nama_lengkap,
      },
      is_locked: _count.Anggota_Ekstrakurikuler > 0,
      ...rest,
    }));
  }

  async get(id: string) {
    const ekstrakurikuler = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      select: {
        id_periode_ajar: true,
      },
    });
    if (!ekstrakurikuler)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ekstrakurikuler not found',
      });

    const result = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      include: {
        _count: {
          select: {
            Anggota_Ekstrakurikuler: {
              where: {
                Siswa: this.commonUtilsService.createSiswaLockedSelector(
                  ekstrakurikuler.id_periode_ajar
                ),
              },
            },
          },
        },
        Guru: {
          select: {
            nama_lengkap: true,
            NIP: true,
          },
        },
      },
    });

    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ekstrakurikuler not found',
      });

    const { Guru, username_guru, _count, ...rest } = result;
    return {
      guru: {
        username: username_guru,
        ...Guru,
      },
      is_locked: _count.Anggota_Ekstrakurikuler > 0,
      ...rest,
    };
  }

  async add(periodeAjarId: string, nama: string, usernameGuru: string) {
    const result = await this.prismaClient.ekstrakurikuler.create({
      data: {
        nama,
        id_periode_ajar: periodeAjarId,
        username_guru: usernameGuru,
      },
    });
    return result.id_esktrakurikuler;
  }

  private async ensureIsNotLocked(id: string) {
    const ekstrakurikuler = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      select: {
        id_periode_ajar: true,
      },
    });
    if (!ekstrakurikuler)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ekstrakurikuler not found',
      });

    const result = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      select: {
        _count: {
          select: {
            Anggota_Ekstrakurikuler: {
              where: {
                Siswa: this.commonUtilsService.createSiswaLockedSelector(
                  ekstrakurikuler.id_periode_ajar
                ),
              },
            },
          },
        },
      },
    });

    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Ekstrakurikuler not found',
      });
    if (result._count.Anggota_Ekstrakurikuler > 0)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Ekstrakurikuler is locked',
      });
  }

  async update(id: string, nama: string, usernameGuru: string) {
    await this.ensureIsNotLocked(id);

    try {
      await this.prismaClient.ekstrakurikuler.update({
        data: {
          nama,
          username_guru: usernameGuru,
        },
        where: {
          id_esktrakurikuler: id,
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e))
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Ekstrakurikuler not found',
        });
      else throw e;
    }
  }
}
