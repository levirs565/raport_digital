import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TRPCError } from '@trpc/server';

@Injectable()
export class CommonUtilsService {
  constructor(private readonly prismaClient: PrismaService) {}

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
}
