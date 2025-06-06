import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { RaportService } from '../../raport/raport.service';
import { CommonUtilsService } from '../../common/common.utils.service';

interface Prestasi {
  jenis: string;
  keterangan: string;
}

interface Kehadiran {
  sakit_hari: number;
  izin_hari: number;
  alpa_hari: number;
}

@Injectable()
export class GuruWaliKelasService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly raportService: RaportService,
    private readonly commonUtilsService: CommonUtilsService
  ) {}

  async getAll(sessionUsername: string, periodeId: string) {
    const result = await this.prismaClient.kelas.findMany({
      where: {
        username_wali_kelas: sessionUsername,
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
        username_wali_kelas: true,
      },
    });

    if (!result) this.throwNotFound();
    if (result.username_wali_kelas != sessionUsername)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You have no access to this kelas',
      });
  }

  async get(sessionUsername: string, kelasId: string) {
    await this.ensureAccess(sessionUsername, kelasId);

    return this.commonUtilsService.getKelas(kelasId);
  }

  async getAllAnggota(sessionUsername: string, kelasId: string) {
    await this.ensureAccess(sessionUsername, kelasId);

    return this.raportService.getAllAnggotaKelasAndStatusRaport(kelasId);
  }

  async getRekapNilai(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    const result = await this.raportService.getRekapNilai(kelasId, siswaId);
    if (result == null) this.throwNotFound();
    return result;
  }

  async getRaportPDF(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    const result = await this.raportService.getRaportPDF(kelasId, siswaId);
    if (result == null) this.throwNotFound();
    return result;
  }

  async confirmRaport(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    const { status, periodeId } = await this.raportService.getRaportStatus(
      kelasId,
      siswaId
    );
    if (status != 'MENUNGGU_KONFIRMASI')
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Sudah dikonfirmasi',
      });

    await this.prismaClient.raport.upsert({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: periodeId,
          id_siswa: siswaId,
        },
      },
      create: {
        id_periode_ajar: periodeId,
        id_siswa: siswaId,
        status: 'DIKONFIRMASI',
      },
      update: {
        status: 'DIKONFIRMASI',
        alasan_tolak: null
      },
    });
  }

  async getAnggota(sessionUsername: string, kelasId: string, siswaId: string) {
    await this.ensureAccess(sessionUsername, kelasId);

    return this.raportService.getAnggotaKelasAndStatusRaport(kelasId, siswaId);
  }

  async getKehadiran(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.raport.findUnique({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: await this.commonUtilsService.getPeriodeFromKelas(
            kelasId
          ),
          id_siswa: siswaId,
        },
      },
      select: {
        alpa_hari: true,
        izin_hari: true,
        sakit_hari: true,
      },
    });

    return (
      result ?? {
        sakit_hari: 0,
        izin_hari: 0,
        alpa_hari: 0,
      }
    );
  }

  async updateKehadiran(
    sessionUsername: string,
    kelasId: string,
    siswaId: string,
    kehadiran: Kehadiran
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const periodeId = await this.commonUtilsService.getPeriodeFromKelas(
      kelasId
    );
    await this.prismaClient.raport.upsert({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: periodeId,
          id_siswa: siswaId,
        },
      },
      update: kehadiran,
      create: {
        id_periode_ajar: periodeId,
        id_siswa: siswaId,
        ...kehadiran,
      },
    });
  }

  async getCatatanWaliKelas(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.raport.findUnique({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: await this.commonUtilsService.getPeriodeFromKelas(
            kelasId
          ),
          id_siswa: siswaId,
        },
      },
      select: {
        catatan_wali_kelas: true,
      },
    });

    return result?.catatan_wali_kelas ?? '';
  }

  async updateCatatanWaliKelas(
    sessionUsername: string,
    kelasId: string,
    siswaId: string,
    catatan: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const periodeId = await this.commonUtilsService.getPeriodeFromKelas(
      kelasId
    );
    await this.prismaClient.raport.upsert({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: periodeId,
          id_siswa: siswaId,
        },
      },
      update: {
        catatan_wali_kelas: catatan,
      },
      create: {
        id_periode_ajar: periodeId,
        id_siswa: siswaId,
        catatan_wali_kelas: catatan,
      },
    });
  }

  async getAllPrestasi(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.prestasi.findMany({
      where: {
        id_periode_ajar: await this.commonUtilsService.getPeriodeFromKelas(
          kelasId
        ),
      },
      select: {
        id_prestasi: true,
        jenis: true,
        keterangan: true,
      },
    });

    return result;
  }

  private async ensurePrestasiAccess(
    sessionUsername: string,
    kelasId: string,
    prestasiId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);

    const result = await this.prismaClient.prestasi.findUnique({
      where: {
        id_prestasi: prestasiId,
      },
      select: {
        id_siswa: true,
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Prestasi not found',
      });
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, result.id_siswa);
  }

  async getPrestasi(
    sessionUsername: string,
    kelasId: string,
    prestasiId: string
  ) {
    await this.ensurePrestasiAccess(sessionUsername, kelasId, prestasiId);

    const result = await this.prismaClient.prestasi.findUnique({
      where: {
        id_prestasi: prestasiId,
      },
      select: {
        id_prestasi: true,
        jenis: true,
        keterangan: true,
      },
    });

    return result;
  }

  async addPrestasi(
    sessionUsername: string,
    kelasId: string,
    siswaId: string,
    prestasi: Prestasi
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.prestasi.create({
      data: {
        id_periode_ajar: await this.commonUtilsService.getPeriodeFromKelas(
          kelasId
        ),
        id_siswa: siswaId,
        ...prestasi,
      },
    });

    return result.id_prestasi;
  }

  async updatePrestasi(
    sessionUsername: string,
    kelasId: string,
    prestasiId: string,
    prestasi: Prestasi
  ) {
    await this.ensurePrestasiAccess(sessionUsername, kelasId, prestasiId);

    await this.prismaClient.prestasi.update({
      where: {
        id_prestasi: prestasiId,
      },
      data: prestasi,
    });
  }

  async deletePrestasi(
    sessionUsername: string,
    kelasId: string,
    prestasiId: string
  ) {
    await this.ensurePrestasiAccess(sessionUsername, kelasId, prestasiId);

    await this.prismaClient.prestasi.delete({
      where: {
        id_prestasi: prestasiId,
      },
    });
  }
}
