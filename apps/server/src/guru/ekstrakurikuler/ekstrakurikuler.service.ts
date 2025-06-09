import { TRPCError } from '@trpc/server';
import { PrismaService } from '../../prisma/prisma.service';
import { $Enums } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { isRaportLocked, isSubset, setDifference } from '../../utils';

export interface NilaiEkstrakurikuler {
  id_siswa: string;
  nilai?: $Enums.Nilai_Ekstrakurikuler;
  keterangan?: string;
}

@Injectable()
export class GuruEkstrakurikulerService {
  constructor(private readonly prismaClient: PrismaService) {}

  async getAll(sessionUsername: string, periodeAjarId: string) {
    const result = this.prismaClient.ekstrakurikuler.findMany({
      where: {
        id_periode_ajar: periodeAjarId,
        username_guru: sessionUsername,
      },
      select: {
        id_esktrakurikuler: true,
        nama: true,
      },
    });

    return result;
  }

  private throwNotFound(): never {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Ekstrakurikuler not found',
    });
  }

  private throwForbidden(): never {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Forbidden access to ekstrakurikuler',
    });
  }

  async get(sessionUsername: string, id: string) {
    const result = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      select: {
        id_periode_ajar: true,
        id_esktrakurikuler: true,
        nama: true,
        username_guru: true,
      },
    });

    if (!result) this.throwNotFound();
    if (result.username_guru != sessionUsername) this.throwForbidden();

    return result;
  }

  async getAnggotaList(sessionUsername: string, id: string) {
    const ekstrakurikuler = await this.ensureCanEdit(sessionUsername, id);
    const result = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      select: {
        username_guru: true,
        Anggota_Ekstrakurikuler: {
          select: {
            nilai: true,
            keterangan: true,
            Siswa: {
              select: {
                id_siswa: true,
                nama: true,
                NIS: true,
                NISN: true,
                Raport: {
                  where: {
                    id_periode_ajar: ekstrakurikuler.id_periode_ajar,
                  },
                  take: 1,
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!result) this.throwNotFound();

    return result.Anggota_Ekstrakurikuler.map(
      ({ nilai, keterangan, Siswa: { Raport, ...Siswa } }) => ({
        ...Siswa,
        nilai,
        keterangan,
        is_locked: isRaportLocked(Raport.at(0)?.status),
      })
    );
  }

  private async ensureCanEdit(sessionUsername: string, id: string) {
    const data = await this.prismaClient.ekstrakurikuler.findUnique({
      where: {
        id_esktrakurikuler: id,
      },
      select: {
        username_guru: true,
        id_periode_ajar: true,
      },
    });

    if (!data) this.throwNotFound();
    if (data.username_guru != sessionUsername) this.throwForbidden();

    return data;
  }

  async updateAnggotaList(
    sessionUsername: string,
    id: string,
    siswaIdList: string[]
  ) {
    const ekstrakurikuler = await this.ensureCanEdit(sessionUsername, id);

    const lockedAnggota = new Set(
      (
        await this.prismaClient.anggota_Ekstrakurikuler.findMany({
          where: {
            id_ekstrakurikuler: id,
            Siswa: {
              Raport: {
                some: {
                  id_periode_ajar: ekstrakurikuler.id_periode_ajar,
                  status: {
                    not: 'MENUNGGU_KONFIRMASI',
                  },
                },
              },
            },
          },
          select: {
            id_siswa: true,
          },
        })
      ).map((Anggota) => Anggota.id_siswa)
    );
    const currentAnggota = new Set(siswaIdList);

    if (!isSubset(lockedAnggota, currentAnggota))
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Cannot delete locked anggota',
      });

    const otherAnggota = setDifference(currentAnggota, lockedAnggota);

    const newLockedAnggota = await this.prismaClient.raport.findMany({
      where: {
        id_periode_ajar: ekstrakurikuler.id_periode_ajar,
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

    await this.prismaClient.$transaction([
      this.prismaClient.anggota_Ekstrakurikuler.deleteMany({
        where: {
          id_ekstrakurikuler: id,
          id_siswa: {
            notIn: siswaIdList,
          },
        },
      }),
      this.prismaClient.anggota_Ekstrakurikuler.createMany({
        data: siswaIdList.map((siswaId) => ({
          id_ekstrakurikuler: id,
          id_siswa: siswaId,
        })),
        skipDuplicates: true,
      }),
    ]);
  }

  async updateNilai(
    sessionUsername: string,
    id: string,
    nilai: NilaiEkstrakurikuler[]
  ) {
    const ekstrakurikuler = await this.ensureCanEdit(sessionUsername, id);

    const validList = await this.prismaClient.anggota_Ekstrakurikuler.findMany({
      where: {
        id_ekstrakurikuler: id,
        id_siswa: {
          in: nilai.map((nilai) => nilai.id_siswa),
        },
        Siswa: {
          OR: [
            {
              Raport: {
                none: {
                  id_periode_ajar: ekstrakurikuler.id_periode_ajar,
                },
              },
            },
            {
              Raport: {
                some: {
                  id_periode_ajar: ekstrakurikuler.id_periode_ajar,
                  status: "MENUNGGU_KONFIRMASI"
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

    if (validList.length != nilai.length) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid siswa found',
      });
    }

    await this.prismaClient.$transaction(
      nilai.map(({ id_siswa, nilai, keterangan }) =>
        this.prismaClient.anggota_Ekstrakurikuler.update({
          where: {
            id_ekstrakurikuler_id_siswa: {
              id_ekstrakurikuler: id,
              id_siswa: id_siswa,
            },
          },
          data: {
            nilai,
            keterangan,
          },
        })
      )
    );
  }
}
