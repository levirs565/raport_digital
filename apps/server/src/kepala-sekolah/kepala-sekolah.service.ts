import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RaportService } from '../raport/raport.service';
import { CommonUtilsService } from '../common/common.utils.service';
import { TRPCError } from '@trpc/server';

export type RaportVerifyState =
  | {
      is_verified: true;
    }
  | {
      is_verified: false;
      reason: string;
    };

@Injectable()
export class KepalaSekolahService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly raportService: RaportService
  ) {}

  async getAllKelas(periodeAjarId: string) {
    const result = await this.prismaClient.kelas.findMany({
      where: {
        id_periode_ajar: periodeAjarId,
      },
      select: {
        id_kelas: true,
        id_periode_ajar: true,
        kelas: true,
        kode_ruang_kelas: true,
        Anggota_Kelas: {
          select: {
            Siswa: {
              select: {
                Raport: {
                  where: {
                    id_periode_ajar: periodeAjarId,
                    status: 'DIKONFIRMASI',
                  },
                  select: {
                    id_siswa: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return result.map(({ Anggota_Kelas, ...rest }) => ({
      menunggu_verifikasi_count: Anggota_Kelas.filter(
        (anggota) => anggota.Siswa.Raport.length > 0
      ).length,
      ...rest,
    }));
  }

  async getKelas(kelasId: string) {
    return this.commonUtilsService.getKelas(kelasId);
  }

  async getAllAnggotaKelas(kelasId: string) {
    return this.raportService.getAllAnggotaKelasAndStatusRaport(kelasId);
  }

  async getAnggotaKelas(kelasId: string, siswaId: string) {
    return this.raportService.getAnggotaKelasAndStatusRaport(kelasId, siswaId)
  }

  async getRaportPDF(kelasId: string, siswaId: string) {
    return this.raportService.getRaportPDF(kelasId, siswaId);
  }

  async verifyRaport(
    kelasId: string,
    siswaId: string,
    state: RaportVerifyState
  ) {
    const { status, periodeId } = await this.raportService.getRaportStatus(
      kelasId,
      siswaId
    );
    if (status != 'DIKONFIRMASI')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Raport tidak dapat diverifikasi',
      });

    await this.prismaClient.raport.update({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: periodeId,
          id_siswa: siswaId,
        },
      },
      data: state.is_verified
        ? {
            status: 'DIVERIFIKASI',
          }
        : {
            status: 'MENUNGGU_KONFIRMASI',
            alasan_tolak: state.reason,
          },
    });
  }

  async unlockRaport(
    kelasId: string,
    siswaId: string,
  ) {
    const { status, periodeId } = await this.raportService.getRaportStatus(
      kelasId,
      siswaId
    );
    if (status != 'DIVERIFIKASI')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Raport tidak dapat dibuka kunci',
      });

    await this.prismaClient.raport.update({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: periodeId,
          id_siswa: siswaId,
        },
      },
      data: {
        status: "MENUNGGU_KONFIRMASI",
      }
    });
  }
}
