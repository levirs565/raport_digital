import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { Nilai_P5_Enum } from '@prisma/client';

interface ProyekP5 {
  tema: string;
  judul: string;
  deskripsi: string;
}

interface CatatanProyekP5 {
  id_siswa: string;
  catatan_proses?: string;
}

interface TargetP5 {
  dimensi: string;
  elemen: string;
  subelemen: string;
  target: string;
}

interface NilaiP5 {
  id_siswa: string;
  nilai?: Nilai_P5_Enum;
}

@Injectable()
export class GuruP5Service {
  constructor(private readonly prismaClient: PrismaService) {}

  async getAll(sessionUsername: string, periodeId: string) {
    const result = await this.prismaClient.kelas.findMany({
      where: {
        username_koor_p5: sessionUsername,
        id_periode_ajar: periodeId,
      },
      select: {
        id_kelas: true,
        kelas: true,
        kode_ruang_kelas: true,
      },
    });

    return result;
  }

  private throwNotFound(): never {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Kelas not found',
    });
  }

  private async ensureAccess(sessionUsername: string, kelasId: string) {
    const result = await this.prismaClient.kelas.findUnique({
      where: {
        id_kelas: kelasId,
      },
      select: {
        username_koor_p5: true,
      },
    });

    if (!result) this.throwNotFound();

    if (result.username_koor_p5 != sessionUsername)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Kelas cannot accessed',
      });
  }

  async get(sessionUsername: string, kelasId: string) {
    await this.ensureAccess(sessionUsername, kelasId);

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
    if (!result) this.throwNotFound();

    return result;
  }

  async getProyekList(sessionUsername: string, kelasId: string) {
    await this.ensureAccess(sessionUsername, kelasId);

    const result = await this.prismaClient.proyek_P5.findMany({
      where: {
        id_kelas: kelasId,
      },
      select: {
        id_proyek_p5: true,
        judul: true,
      },
    });

    return result;
  }

  async addProyek(sessionUsername: string, kelasId: string, proyek: ProyekP5) {
    await this.ensureAccess(sessionUsername, kelasId);

    const result = await this.prismaClient.proyek_P5.create({
      data: {
        id_kelas: kelasId,
        ...proyek,
      },
    });

    return result.id_proyek_p5;
  }

  private throwProyekNotFound(): never {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Proyek not found',
    });
  }

  private async ensureProyekAccess(sessionUsername: string, proyekId: string) {
    const result = await this.prismaClient.proyek_P5.findUnique({
      where: {
        id_proyek_p5: proyekId,
      },
      select: {
        Kelas: {
          select: {
            username_koor_p5: true,
          },
        },
      },
    });

    if (!result) this.throwProyekNotFound();

    if (result.Kelas.username_koor_p5 != sessionUsername)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Proyek cannot accessed',
      });
  }

  async updateProyek(
    sessionUsername: string,
    proyekId: string,
    proyek: ProyekP5
  ) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    await this.prismaClient.proyek_P5.update({
      where: {
        id_proyek_p5: proyekId,
      },
      data: proyek,
    });
  }

  async getProyek(sessionUsername: string, proyekId: string) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    const result = await this.prismaClient.proyek_P5.findUnique({
      where: {
        id_proyek_p5: proyekId,
      },
    });
    if (!result) this.throwProyekNotFound();

    return result;
  }

  async deleteProyek(sessionUsername: string, proyekId: string) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    await this.prismaClient.proyek_P5.delete({
      where: {
        id_proyek_p5: proyekId,
      },
    });
  }

  async getCatatanProsesProyek(sessionUsername: string, proyekId: string) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    const result = await this.prismaClient.proyek_P5.findUnique({
      where: {
        id_proyek_p5: proyekId,
      },
      select: {
        Kelas: {
          select: {
            Anggota_Kelas: {
              select: {
                Siswa: {
                  select: {
                    id_siswa: true,
                    NIS: true,
                    NISN: true,
                    nama: true,
                    Catatan_Proses_P5: {
                      where: {
                        id_proyek_p5: proyekId,
                      },
                      select: {
                        catatan: true,
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
    if (!result) this.throwProyekNotFound();

    return result.Kelas.Anggota_Kelas.map(
      ({ Siswa: { Catatan_Proses_P5, ...Siswa } }) => ({
        ...Siswa,
        catatan_proses: Catatan_Proses_P5.at(0)?.catatan ?? undefined,
      })
    );
  }

  async ensureSiswaIds(kelasId: string, siswaIds: string[]) {
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

  async updateCatatanProsesProyek(
    sessionUsername: string,
    proyekId: string,
    catatan: CatatanProyekP5[]
  ) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    const kelasId = await this.prismaClient.proyek_P5.findUnique({
      where: {
        id_proyek_p5: proyekId,
      },
      select: {
        Kelas: {
          select: {
            id_kelas: true,
          },
        },
      },
    });
    if (!kelasId) this.throwProyekNotFound();
    await this.ensureSiswaIds(
      kelasId.Kelas.id_kelas,
      catatan.map(({ id_siswa }) => id_siswa)
    );

    await this.prismaClient.$transaction(
      catatan.map((catatan) =>
        this.prismaClient.catatan_Proses_P5.upsert({
          where: {
            id_proyek_p5_id_siswa: {
              id_proyek_p5: proyekId,
              id_siswa: catatan.id_siswa,
            },
          },
          update: {
            catatan: catatan.catatan_proses,
          },
          create: {
            id_proyek_p5: proyekId,
            id_siswa: catatan.id_siswa,
            catatan: catatan.catatan_proses,
          },
        })
      )
    );
  }

  async getAllTarget(sessionUsername: string, proyekId: string) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    const result = await this.prismaClient.target_P5.findMany({
      where: {
        id_proyek_p5: proyekId,
      },
      select: {
        id_target_p5: true,
        dimensi: true,
        target: true
      }
    });

    return result;
  }

  async addTarget(sessionUsername: string, proyekId: string, target: TargetP5) {
    await this.ensureProyekAccess(sessionUsername, proyekId);

    const result = await this.prismaClient.target_P5.create({
      data: {
        id_proyek_p5: proyekId,
        ...target,
      },
    });

    return result.id_target_p5
  }

  private throwTargetNotFound(): never {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Target not found',
    });
  }

  private async ensureTargetAccess(sessionUsername: string, targetId: string) {
    const result = await this.prismaClient.target_P5.findUnique({
      where: {
        id_target_p5: targetId,
      },
      select: {
        Proyek_P5: {
          select: {
            Kelas: {
              select: {
                username_koor_p5: true,
              },
            },
          },
        },
      },
    });

    if (!result) this.throwProyekNotFound();

    if (result.Proyek_P5.Kelas.username_koor_p5 != sessionUsername)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Target cannot accessed',
      });
  }

  async updateTarget(
    sessionUsername: string,
    targetId: string,
    target: TargetP5
  ) {
    await this.ensureTargetAccess(sessionUsername, targetId);

    await this.prismaClient.target_P5.update({
      where: {
        id_target_p5: targetId,
      },
      data: target,
    });
  }

  async deleteTarget(sessionUsername: string, targetId: string) {
    await this.ensureTargetAccess(sessionUsername, targetId);

    await this.prismaClient.target_P5.delete({
      where: {
        id_target_p5: targetId,
      },
    });
  }

  async getTarget(sessionUsername: string, targetId: string) {
    await this.ensureTargetAccess(sessionUsername, targetId);

    const result = await this.prismaClient.target_P5.findUnique({
      where: {
        id_target_p5: targetId,
      },
      omit: {
        id_proyek_p5: true,
      },
    });
    if (!result) this.throwTargetNotFound();

    return result;
  }

  async getNilaiTarget(sessionUsername: string, targetId: string) {
    await this.ensureTargetAccess(sessionUsername, targetId);

    const anggotaKelas = await this.prismaClient.target_P5.findUnique({
      where: {
        id_target_p5: targetId,
      },
      select: {
        Proyek_P5: {
          select: {
            Kelas: {
              select: {
                Anggota_Kelas: {
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
                },
              },
            },
          },
        },
      },
    });
    if (!anggotaKelas) this.throwTargetNotFound();
    const nilai = await this.prismaClient.nilai_P5.findMany({
      where: {
        id_target_p5: targetId,
      },
    });

    return anggotaKelas.Proyek_P5.Kelas.Anggota_Kelas.map(({ Siswa }) => ({
      ...Siswa,
      nilai:
        nilai.find((nilai) => nilai.id_siswa == Siswa.id_siswa)?.nilai ??
        undefined,
    }));
  }

  async updateNilaiTarget(
    sessionUsername: string,
    targetId: string,
    nilai: NilaiP5[]
  ) {
    await this.ensureTargetAccess(sessionUsername, targetId);

    const kelasId = await this.prismaClient.target_P5.findUnique({
      where: {
        id_target_p5: targetId,
      },
      select: {
        Proyek_P5: {
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
    if (!kelasId) this.throwTargetNotFound();
    await this.ensureSiswaIds(
      kelasId.Proyek_P5.Kelas.id_kelas,
      nilai.map(({ id_siswa }) => id_siswa)
    );

    await this.prismaClient.$transaction(
      nilai.map((nilai) =>
        this.prismaClient.nilai_P5.upsert({
          where: {
            id_target_p5_id_siswa: {
              id_target_p5: targetId,
              id_siswa: nilai.id_siswa,
            },
          },
          update: {
            nilai: nilai.nilai,
          },
          create: {
            id_target_p5: targetId,
            id_siswa: nilai.id_siswa,
            nilai: nilai.nilai,
          },
        })
      )
    );
  }
}
