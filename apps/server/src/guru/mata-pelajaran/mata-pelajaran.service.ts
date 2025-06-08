import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { CommonUtilsService } from '../../common/common.utils.service';

export interface MataPelajaranKelasID {
  id_kelas: string;
  id_mata_pelajaran: string;
}

export interface NilaiMataPelajaran {
  id_siswa: string;
  nilai: number;
}

@Injectable()
export class GuruMataPelajaranService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly commonUtilsService: CommonUtilsService
  ) {}

  async getAll(sessionUsername: string, periodeAjarId: string) {
    const result = await this.prismaClient.mata_Pelajaran_Kelas.findMany({
      where: {
        username_guru: sessionUsername,
        Kelas: {
          id_periode_ajar: periodeAjarId,
        },
      },
      include: {
        Kelas: {
          select: {
            id_kelas: true,
            kelas: true,
            kode_ruang_kelas: true,
          },
        },
        Mata_Pelajaran: {
          select: {
            nama: true,
            kelompok_mapel: true,
            id_mata_pelajaran: true,
          },
        },
      },
    });

    return result.map(({ Mata_Pelajaran, Kelas }) => ({
      mata_pelajaran: Mata_Pelajaran,
      kelas: Kelas,
    }));
  }

  private throwNotFound(): never {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Kelas not found',
    });
  }

  private throwForbidden(): never {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You have not acces to this resource',
    });
  }

  private async ensureAccess(
    sessionUsername: string,
    id: MataPelajaranKelasID
  ) {
    const result = await this.prismaClient.mata_Pelajaran_Kelas.findUnique({
      where: {
        id_mata_pelajaran_id_kelas: id,
      },
      select: {
        username_guru: true,
      },
    });

    if (!result) this.throwNotFound();
    if (result.username_guru != sessionUsername) this.throwForbidden();
  }

  async get(sessionUsername: string, id: MataPelajaranKelasID) {
    await this.ensureAccess(sessionUsername, id);

    const result = await this.prismaClient.mata_Pelajaran_Kelas.findUnique({
      where: {
        id_mata_pelajaran_id_kelas: id,
      },
      select: {
        Kelas: {
          select: {
            id_kelas: true,
            kelas: true,
            kode_ruang_kelas: true,
          },
        },
        Mata_Pelajaran: {
          select: {
            nama: true,
            kelompok_mapel: true,
            id_mata_pelajaran: true,
          },
        },
      },
    });
    if (!result) this.throwNotFound();

    return {
      mata_pelajaran: result.Mata_Pelajaran,
      kelas: result.Kelas,
    };
  }

  async getMateriList(sessionUsername: string, id: MataPelajaranKelasID) {
    await this.ensureAccess(sessionUsername, id);

    const result = await this.prismaClient.mata_Pelajaran_Kelas.findUnique({
      where: {
        id_mata_pelajaran_id_kelas: id,
      },
      select: {
        Materi: {
          omit: {
            detail: true,
          },
          orderBy: {
            nama: 'asc',
          },
        },
      },
    });

    if (!result) this.throwNotFound();

    const PASIndex = result.Materi.findIndex((materi) => materi.nama == 'PAS');

    if (PASIndex != -1) {
      const PAS = result.Materi[PASIndex];
      result.Materi.splice(PASIndex, 1);
      result.Materi.push(PAS);
    }

    return result.Materi.map(
      ({ id_kelas, id_mata_pelajaran, ...rest }) => rest
    );
  }

  private ensureNameValid(nama: string) {
    if (nama == 'PAS')
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "'PAS' bukan nama valid",
      });
  }

  async addMateri(
    sessionUsername: string,
    id: MataPelajaranKelasID,
    nama: string,
    detail: string
  ) {
    await this.ensureAccess(sessionUsername, id);
    await this.ensureNameValid(nama);

    const result = await this.prismaClient.materi.create({
      data: {
        id_mata_pelajaran: id.id_mata_pelajaran,
        id_kelas: id.id_kelas,
        nama,
        detail,
      },
    });

    return result.id_materi;
  }

  private async ensureMateriAccess(
    sessionUsername: string,
    id: string,
    checkIsPAS: boolean
  ) {
    const data = await this.prismaClient.materi.findUnique({
      where: {
        id_materi: id,
      },
      select: {
        nama: checkIsPAS,
        Mata_Pelajaran_Kelas: {
          select: {
            username_guru: true,
          },
        },
      },
    });

    if (!data) this.throwNotFound();
    if (data.Mata_Pelajaran_Kelas.username_guru != sessionUsername)
      this.throwForbidden();
    if (checkIsPAS && data.nama == 'PAS')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'PAS cannot be modified',
      });
  }

  async getMateri(sessionUsername: string, id: string) {
    await this.ensureMateriAccess(sessionUsername, id, false);

    const result = await this.prismaClient.materi.findUnique({
      where: {
        id_materi: id,
      },
      select: {
        id_materi: true,
        nama: true,
        detail: true,
        Mata_Pelajaran_Kelas: {
          include: {
            Kelas: {
              select: {
                id_kelas: true,
                kelas: true,
                kode_ruang_kelas: true,
              },
            },
            Mata_Pelajaran: {
              select: {
                id_mata_pelajaran: true,
                nama: true,
                kelompok_mapel: true,
              },
            },
          },
        },
      },
    });
    if (!result) this.throwNotFound();

    const { Mata_Pelajaran_Kelas, ...rest } = result;

    return {
      ...rest,
      kelas: Mata_Pelajaran_Kelas.Kelas,
      mata_pelajaran: Mata_Pelajaran_Kelas.Mata_Pelajaran,
    };
  }

  async updateMateri(
    sessionUsername: string,
    id: string,
    nama: string,
    detail: string
  ) {
    await this.ensureMateriAccess(sessionUsername, id, true);
    await this.ensureNameValid(nama);

    await this.prismaClient.materi.update({
      where: {
        id_materi: id,
      },
      data: {
        nama,
        detail,
      },
    });
  }

  async deleteMateri(sessionUsername: string, id: string) {
    await this.ensureMateriAccess(sessionUsername, id, true);

    await this.prismaClient.materi.delete({
      where: {
        id_materi: id,
      },
    });
  }

  async getNilaiMateri(sessionUsername: string, id: string) {
    await this.ensureMateriAccess(sessionUsername, id, false);

    const data = await this.prismaClient.materi.findUnique({
      where: {
        id_materi: id,
      },
      select: {
        Nilai_Materi: {
          select: {
            id_siswa: true,
            nilai: true,
          },
        },
        Mata_Pelajaran_Kelas: {
          select: {
            Kelas: {
              select: {
                Anggota_Kelas: {
                  select: {
                    Siswa: {
                      select: {
                        id_siswa: true,
                        nama: true,
                        NIS: true,
                        NISN: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!data) this.throwNotFound();

    const result = data.Mata_Pelajaran_Kelas.Kelas.Anggota_Kelas.map(
      ({ Siswa }) => ({
        ...Siswa,
        nilai:
          data.Nilai_Materi.find((nilai) => nilai.id_siswa == Siswa.id_siswa)
            ?.nilai ?? 0,
      })
    );

    return result;
  }

  async updateNilaiMateri(
    sessionUsername: string,
    id: string,
    nilaiList: NilaiMataPelajaran[]
  ) {
    await this.ensureMateriAccess(sessionUsername, id, false);

    const kelas = await this.prismaClient.materi.findUnique({
      where: {
        id_materi: id,
      },
      select: {
        Mata_Pelajaran_Kelas: {
          select: {
            Kelas: {
              select: {
                id_kelas: true,
              },
            },
          },
        },
      },
    });
    if (!kelas) this.throwNotFound();
    await this.commonUtilsService.ensureSiswaListInKelas(
      kelas.Mata_Pelajaran_Kelas.Kelas.id_kelas,
      nilaiList.map((nilai) => nilai.id_siswa)
    );

    await this.prismaClient.$transaction(
      nilaiList.map(({ id_siswa, nilai }) =>
        this.prismaClient.nilai_Materi.upsert({
          where: {
            id_materi_id_siswa: {
              id_materi: id,
              id_siswa,
            },
          },
          create: {
            id_materi: id,
            id_siswa,
            nilai,
          },
          update: {
            nilai,
          },
        })
      )
    );
  }

  async getTotalNilai(sessionUsername: string, id: MataPelajaranKelasID) {
    await this.ensureAccess(sessionUsername, id);

    // FIX: Perbaiki perhitungan
    const materiCount = await this.prismaClient.materi.count({
      where: {
        id_kelas: id.id_kelas,
        id_mata_pelajaran: id.id_mata_pelajaran,
      },
    });
    const result = await this.prismaClient.nilai_Materi.groupBy({
      by: ['id_siswa'],
      where: {
        Materi: {
          id_mata_pelajaran: id.id_mata_pelajaran,
          id_kelas: id.id_kelas,
        },
      },
      _sum: {
        nilai: true,
      },
    });

    const anggotaKelas = await this.prismaClient.anggota_Kelas.findMany({
      where: {
        id_kelas: id.id_kelas,
      },
      select: {
        Siswa: {
          select: {
            id_siswa: true,
            NIS: true,
            NISN: true,
            nama: true,
          },
        },
      },
    });

    return anggotaKelas.map(({ Siswa }) => ({
      ...Siswa,
      nilai:
        (result.find((nilai) => nilai.id_siswa == Siswa.id_siswa)?._sum.nilai ??
          0) / materiCount,
    }));
  }
}
