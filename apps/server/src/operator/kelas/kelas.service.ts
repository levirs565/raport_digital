import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { PrismaHelper } from '../../utils';

@Injectable()
export class OperatorKelasService {
  constructor(private readonly prismaClient: PrismaService) {}

  async getAll(periodeAjarId: string) {
    const result = await this.prismaClient.kelas.findMany({
      where: {
        id_periode_ajar: periodeAjarId,
      },
      select: {
        Wali_Kelas: {
          select: {
            username: true,
            nama_lengkap: true,
          },
        },
        id_kelas: true,
        id_periode_ajar: true,
        kelas: true,
        kode_ruang_kelas: true,
      },
    });
    return result.map(({ Wali_Kelas, ...rest }) => ({
      wali_kelas: Wali_Kelas,
      ...rest,
    }));
  }

  private throwNotFound(): never {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Kelas not found',
    });
  }

  async get(id: string) {
    const result = await this.prismaClient.kelas.findUnique({
      where: {
        id_kelas: id,
      },
      include: {
        Wali_Kelas: {
          select: {
            username: true,
            nama_lengkap: true,
            NIP: true,
          },
        },
        Koor_P5: {
          select: {
            username: true,
            nama_lengkap: true,
            NIP: true,
          },
        },
      },
    });

    if (!result) this.throwNotFound();
    console.log(result);

    const {
      Koor_P5,
      Wali_Kelas,
      username_koor_p5,
      username_wali_kelas,
      ...rest
    } = result;

    return {
      ...rest,
      wali_kelas: Wali_Kelas,
      koor_p5: Koor_P5,
    };
  }

  async add(
    periodeAjarId: string,
    kelas: number,
    kodeRuangKelas: string,
    waliKelasUsername: string,
    koorP5Username: string
  ) {
    const result = await this.prismaClient.kelas.create({
      data: {
        id_periode_ajar: periodeAjarId,
        kelas,
        kode_ruang_kelas: kodeRuangKelas,
        username_wali_kelas: waliKelasUsername,
        username_koor_p5: koorP5Username,
      },
    });
    return result.id_kelas;
  }

  async update(
    id: string,
    kelas: number,
    kodeRuangKelas: string,
    waliKelasUsername: string,
    koorP5Username: string
  ) {
    try {
      await this.prismaClient.kelas.update({
        where: {
          id_kelas: id,
        },
        data: {
          kelas,
          kode_ruang_kelas: kodeRuangKelas,
          username_wali_kelas: waliKelasUsername,
          username_koor_p5: koorP5Username,
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) this.throwNotFound();
      else throw e;
    }
  }

  private async ensureFound(id: string) {
    const count = await this.prismaClient.kelas.count({
      where: {
        id_kelas: id,
      },
    });
    if (count == 0) this.throwNotFound();
  }

  async getMataPelajaranList(id: string) {
    await this.ensureFound(id);

    const result = await this.prismaClient.mata_Pelajaran_Kelas.findMany({
      where: {
        id_kelas: id,
      },
      select: {
        Guru: {
          select: {
            username: true,
            NIP: true,
            nama_lengkap: true,
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
    });

    return result.map(({ Guru, Mata_Pelajaran }) => ({
      guru: Guru,
      mata_pelajaran: Mata_Pelajaran,
    }));
  }

  async addMataPelajaran(
    id: string,
    mataPelajaranId: string,
    usernameGuru: string
  ) {
    await this.prismaClient.$transaction([
      this.prismaClient.mata_Pelajaran_Kelas.create({
        data: {
          id_kelas: id,
          id_mata_pelajaran: mataPelajaranId,
          username_guru: usernameGuru,
        },
      }),
      this.prismaClient.materi.create({
        data: {
          id_kelas: id,
          id_mata_pelajaran: mataPelajaranId,
          nama: 'PAS',
          detail: '',
        },
      }),
    ]);
  }

  async updateMataPelajaran(
    id: string,
    mataPelajaranId: string,
    usernameGuru: string
  ) {
    try {
      await this.prismaClient.mata_Pelajaran_Kelas.update({
        where: {
          id_mata_pelajaran_id_kelas: {
            id_kelas: id,
            id_mata_pelajaran: mataPelajaranId,
          },
        },
        data: {
          username_guru: usernameGuru,
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) this.throwNotFound();
      else throw e;
    }
  }

  async deleteMataPelajaran(id: string, mataPelajaranId: string) {
    await this.ensureFound(id);
    try {
      await this.prismaClient.mata_Pelajaran_Kelas.delete({
        where: {
          id_mata_pelajaran_id_kelas: {
            id_kelas: id,
            id_mata_pelajaran: mataPelajaranId,
          },
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e))
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Mata pelajaran not found in Kelas',
        });
      else throw e;
    }
  }

  async getAnggotaList(id: string) {
    await this.ensureFound(id);

    const result = await this.prismaClient.anggota_Kelas.findMany({
      where: {
        id_kelas: id,
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

    return result.map(({ Siswa }) => Siswa);
  }

  async updateAnggotaList(id: string, anggotaIdList: string[]) {
    await this.ensureFound(id);

    const anggotaKelasLain = await this.prismaClient.anggota_Kelas.findMany({
      where: {
        id_siswa: {
          in: anggotaIdList,
        },
        id_kelas: {
          not: id,
        },
      },
      select: {
        Siswa: {
          select: {
            nama: true,
            NIS: true,
            NISN: true,
          },
        },
      },
    });
    if (anggotaKelasLain.length > 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message:
          anggotaKelasLain
            .map(({ Siswa }) => `${Siswa.nama} (${Siswa.NIS}/${Siswa.NISN})`)
            .join(', ') + ' sudah berada di kelas lain',
      });
    }
    try {
      await this.prismaClient.$transaction([
        this.prismaClient.kelas.update({
          where: {
            id_kelas: id,
          },
          data: {
            Anggota_Kelas: {
              deleteMany: {},
              create: anggotaIdList.map((id) => ({
                id_siswa: id,
              })),
            },
          },
        }),
        this.prismaClient.nilai_Materi.deleteMany({
          where: {
            Materi: {
              id_kelas: id
            },
            id_siswa: {
              notIn: anggotaIdList
            }
          }
        }),
        this.prismaClient.catatan_Proses_P5.deleteMany({
          where: {
            Proyek_P5: {
              id_kelas: id
            },
            id_siswa: {
              notIn: anggotaIdList
            }
          }
        }),
        this.prismaClient.nilai_P5.deleteMany({
          where: {
            Target_P5: {
              Proyek_P5: {
                id_kelas: id
              }
            },
            id_siswa: {
              notIn: anggotaIdList
            }
          }
        })
      ]);
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) {
        this.throwNotFound();
      } else throw e;
    }
  }

  async deleteAnggota(id: string, siswaId: string) {
    await this.ensureFound(id);
    try {
      await this.prismaClient.anggota_Kelas.delete({
        where: {
          id_kelas_id_siswa: {
            id_kelas: id,
            id_siswa: siswaId,
          },
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Anggota is not found',
        });
      } else throw e;
    }
  }

  async delete(id: string) {
    try {
      // TODO: Not work
      await this.prismaClient.kelas.delete({
        where: {
          id_kelas: id,
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) this.throwNotFound();
      else throw e;
    }
  }
}
