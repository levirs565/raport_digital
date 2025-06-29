import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { isRaportLocked, isSubset, setDifference } from '../utils';
import { Prisma } from '@prisma/client';

const fullNumberRegex =  /^\d+$/;

@Injectable()
export class CommonUtilsService {
  constructor(private readonly prismaClient: PrismaService) {}

  createSiswaLockedSelector(
    periodeAjarId: string
  ): Extract<
    Parameters<typeof this.prismaClient.siswa.findMany>[0],
    {}
  >['where'] {
    return {
      Raport: {
        some: {
          id_periode_ajar: periodeAjarId,
          status: {
            not: 'MENUNGGU_KONFIRMASI',
          },
        },
      },
    };
  }

  async isKelasLocked(id: string) {
    const count = await this.prismaClient.anggota_Kelas.count({
      where: {
        id_kelas: id,
        Siswa: this.createSiswaLockedSelector(
          await this.getPeriodeFromKelas(id)
        ),
      },
    });

    return count > 0;
  }

  async ensureKelasNotLocked(id: string) {
    if (await this.isKelasLocked(id))
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Kelas terkunci karena ada siswa yang raportnya terkunci',
      });
  }

  async ensureCanUpdateAnggota(
    periodeAjarId: string,
    targetList: string[],
    lockedList: string[]
  ) {
    const lockedAnggota = new Set(lockedList);
    const currentAnggota = new Set(targetList);

    if (!isSubset(lockedAnggota, currentAnggota))
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete locked anggota',
      });

    const otherAnggota = setDifference(currentAnggota, lockedAnggota);

    const newLockedAnggota = await this.prismaClient.raport.findMany({
      where: {
        id_periode_ajar: periodeAjarId,
        id_siswa: {
          in: [...otherAnggota],
        },
        status: {
          not: 'MENUNGGU_KONFIRMASI',
        },
      },
      select: {
        id_siswa: true,
      },
    });

    if (newLockedAnggota.length > 0)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot add locked anggota',
      });
  }

  async ensureSiswaInKelas(kelasId: string, siswaId: string) {
    const result = await this.prismaClient.anggota_Kelas.findUnique({
      where: {
        id_kelas_id_siswa: {
          id_kelas: kelasId,
          id_siswa: siswaId,
        },
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Siswa is not found',
      });
  }

  async ensureSiswaNotLocked(periodeId: string, siswaId: string) {
    const raport = await this.prismaClient.raport.findUnique({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: periodeId,
          id_siswa: siswaId,
        },
      },
      select: {
        status: true,
      },
    });
    if (isRaportLocked(raport?.status))
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Raport is locked',
      });
  }

  async ensureSiswaListNotLockedInKelas(kelasId: string, siswaIds: string[]) {
    const periodeAjarId = await this.getPeriodeFromKelas(kelasId);
    const result = await this.prismaClient.anggota_Kelas.findMany({
      where: {
        id_kelas: kelasId,
        id_siswa: {
          in: siswaIds,
        },
        Siswa: {
          OR: [
            {
              Raport: {
                none: {
                  id_periode_ajar: periodeAjarId,
                },
              },
            },
            {
              Raport: {
                some: {
                  id_periode_ajar: periodeAjarId,
                  status: 'MENUNGGU_KONFIRMASI',
                },
              },
            },
          ],
        },
      },
      select: {
        id_siswa: true,
      },
    });

    if (result.length != siswaIds.length)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid siswa ID found',
      });
  }

  async ensureSiswaListInKelas(kelasId: string, siswaIds: string[]) {
    const actualIds = new Set(
      (
        await this.prismaClient.anggota_Kelas.findMany({
          where: {
            id_kelas: kelasId,
          },
          select: {
            id_siswa: true,
          },
        })
      ).map(({ id_siswa }) => id_siswa)
    );

    if (siswaIds.find((id) => !actualIds.has(id)))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid siswa ID found',
      });
  }

  async getPeriodeFromKelas(kelasId: string) {
    const result = await this.prismaClient.kelas.findUnique({
      where: {
        id_kelas: kelasId,
      },
      select: {
        id_periode_ajar: true,
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Kelas not found',
      });
    return result.id_periode_ajar;
  }

  async getKelas(kelasId: string) {
    const result = await this.prismaClient.kelas.findUnique({
      where: {
        id_kelas: kelasId,
      },
      select: {
        id_kelas: true,
        kelas: true,
        kode_ruang_kelas: true,
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Siswa not found',
      });

    return result;
  }

  async getSiswa(id: string) {
    const result = await this.prismaClient.siswa.findUnique({
      where: {
        id_siswa: id,
      },
      select: {
        id_siswa: true,
        NIS: true,
        NISN: true,
        nama: true,
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Siswa not found',
      });

    return result;
  }

  createSiswaFilter(filter: string | undefined) {
    const filterList: Prisma.SiswaWhereInput = {};

    if (filter) {
      filterList.OR = [];
      filterList.OR.push({
        nama: {
          contains: filter,
        },
      });

      if (fullNumberRegex.test(filter)) {
        filterList.OR.push({
          NIS: {
            contains: filter,
          },
        });
        filterList.OR.push({
          NISN: {
            contains: filter,
          },
        });
      }
    }

    return filterList;
  }
}
