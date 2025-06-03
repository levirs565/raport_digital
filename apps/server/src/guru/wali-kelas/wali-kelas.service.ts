import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import pdfmake from 'pdfmake';
import { Status_Raport } from '@prisma/client';

interface Prestasi {
  jenis: string;
  keterangan: string;
}

interface Kehadiran {
  sakit_hari: number;
  izin_hari: number;
  alpa_hari: number;
}

const pdfPrinter = new pdfmake({
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
});

@Injectable()
export class GuruWaliKelasService {
  constructor(private readonly prismaClient: PrismaService) {}

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

  async getAllAnggota(sessionUsername: string, kelasId: string) {
    await this.ensureAccess(sessionUsername, kelasId);

    const result = await this.prismaClient.anggota_Kelas.findMany({
      where: {
        id_kelas: kelasId,
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

    return result.map((Anggota) => Anggota.Siswa);
  }

  private createMataPelajaranDescription(materi: string, nilai: number) {
    if (nilai >= 90)
      return `Menunjukkan penguasaan yang sangat baik dalam ${materi}`;
    if (nilai >= 75) return `Menunjukkan penguasan yang baik dalam ${materi}`;
    return `Perlu pendampingan dalam ${materi}`;
  }

  private async getInternalRekap(kelasId: string, siswaId: string) {
    const kelas = await this.prismaClient.kelas.findUnique({
      where: {
        id_kelas: kelasId,
      },
      select: {
        id_periode_ajar: true,
        Mata_Pelajaran_Kelas: {
          select: {
            Mata_Pelajaran: {
              select: {
                id_mata_pelajaran: true,
                nama: true,
              },
            },
            _count: {
              select: {
                Materi: true,
              },
            },
          },
        },
      },
    });
    if (!kelas) return null;

    const ekstrakurikuler =
      await this.prismaClient.anggota_Ekstrakurikuler.findMany({
        where: {
          id_siswa: siswaId,
          Ekstrakurikuler: {
            id_periode_ajar: kelas.id_periode_ajar,
          },
        },
        select: {
          Ekstrakurikuler: {
            select: {
              id_esktrakurikuler: true,
              nama: true,
            },
          },
          nilai: true,
          keterangan: true,
        },
      });

    // FIX: Perbaiki rumus
    const nilaiMataPelajaran =
      await this.prismaClient.nilai_Materi_View.groupBy({
        by: ['id_mata_pelajaran'],
        where: {
          id_kelas: kelasId,
          id_siswa: siswaId,
        },
        _sum: {
          nilai: true,
        },
      });

    const deskripsiMataPelajaran =
      await this.prismaClient.nilai_Materi_Ranked_View.findMany({
        where: {
          id_kelas: kelasId,
          id_siswa: siswaId,
          rank: 1,
        },
        select: {
          id_mata_pelajaran: true,
          nilai: true,
          detail: true,
        },
      });

    return {
      mata_pelajaran: kelas.Mata_Pelajaran_Kelas.map(
        ({ Mata_Pelajaran, _count }) => {
          const deskripsi = deskripsiMataPelajaran.find(
            (deskripsi) =>
              deskripsi.id_mata_pelajaran == Mata_Pelajaran.id_mata_pelajaran
          );
          return {
            ...Mata_Pelajaran,
            nilai:
              (nilaiMataPelajaran.find(
                (nilai) =>
                  nilai.id_mata_pelajaran == Mata_Pelajaran.id_mata_pelajaran
              )?._sum.nilai ?? 0) / (_count.Materi == 0 ? 1 : _count.Materi),
            deskripsi: deskripsi
              ? this.createMataPelajaranDescription(
                  deskripsi.detail,
                  deskripsi.nilai
                )
              : undefined,
          };
        }
      ),
      ekstrakurikuler: ekstrakurikuler.map(({ Ekstrakurikuler, ...rest }) => ({
        ...Ekstrakurikuler,
        ...rest,
      })),
    };
  }

  async getRekapNilai(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.ensureSiswaInKelas(kelasId, siswaId);
    const result = await this.getInternalRekap(kelasId, siswaId);
    if (result == null) this.throwNotFound();
    return result;
  }

  async internalGetRaportPDF(
    kelasId: string,
    siswaId: string
  ): Promise<string | null> {
    const rekap = await this.getInternalRekap(kelasId, siswaId);
    if (rekap == null) return null;

    const doc = pdfPrinter.createPdfKitDocument({
      defaultStyle: {
        font: 'Helvetica',
      },
      pageSize: 'A4',
      content: [
        {
          layout: 'noBorders',
          table: {
            headerRows: 0,
            widths: ['15%', '35%', '18%', '32%'],
            body: [
              ['NAMA', ': Nama', 'Kelas', ': Kelas'],
              ['NIS/NISN', ': NIS/NISN', 'Fase', ': D'],
              ['Madrasah', ': -', 'Semester', ': Semester'],
              ['Alamat', ': -', 'Tahun Ajaran', ':'],
            ],
          },
        },
        {
          text: '\n',
        },
        {
          text: 'CAPAIAN HASIL BELAJAR',
          alignment: 'center',
          lineHeight: 1.5,
          bold: true,
          fontSize: 16,
        },
        {
          table: {
            headerRows: 1,
            widths: [20, 150, 50, '*'],
            body: [
              [
                { text: 'Mata Pelajaran', alignment: 'center', colSpan: 2 },
                {},
                { text: 'Nilai Akhir', alignment: 'center' },
                { text: 'Capaian Kompetensi', alignment: 'center' },
              ],
              ...rekap.mata_pelajaran.map((mataPelajaran, index) => [
                { text: (index + 1).toString(), alignment: 'center' },
                { text: mataPelajaran.nama },
                { text: mataPelajaran.nilai.toFixed(0), alignment: 'center' },
                { text: mataPelajaran.deskripsi ?? '-' },
              ]),
              [
                { text: 'Jumlah', colSpan: 2 },
                {},
                {
                  text: rekap.mata_pelajaran
                    .reduce((prev, curr) => prev + curr.nilai, 0)
                    .toFixed(0),
                },
                {},
              ],
            ],
          },
        },
        { text: '\n' },
        { text: 'Ekstrakurikuler', lineHeight: 1.5 },
        {
          table: {
            headerRows: 1,
            widths: [20, 150, 50, '*'],
            body: [
              [
                { text: 'No', alignment: 'center' },
                { text: 'Kegiatan Ekstrakurikuler', alignment: 'center' },
                { text: 'Nilai', alignment: 'center' },
                { text: 'Keterangan', alignment: 'center' },
              ],
              ...rekap.ekstrakurikuler.map((ekstrakurikuler, index) => [
                { text: (index + 1).toString() },
                { text: ekstrakurikuler.nama },
                { text: ekstrakurikuler.nilai },
                { text: ekstrakurikuler.keterangan },
              ]),
            ],
          },
        },
      ],
    });
    const bufferSize = 1073741824;

    return new Promise((resolve) => {
      let chunks: any[] = [];
      doc.on('readable', () => {
        let chunk;
        while ((chunk = doc.read(bufferSize)) !== null) {
          chunks.push(chunk);
        }
      });
      doc.on('end', () => {
        resolve(Buffer.concat(chunks).toString('base64'));
      });
      doc.end();
    });
  }

  async getRaportPDF(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.ensureSiswaInKelas(kelasId, siswaId);
    const result = await this.internalGetRaportPDF(kelasId, siswaId);
    if (result == null) this.throwNotFound();
    return result;
  }

  async getRaportStatus(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const periodeId = await this.getPeriodeFromKelas(kelasId);
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
    if (!raport) return Status_Raport.MENUNGGU_KONFIRMASI;

    return raport.status;
  }

  async confirmRaport(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    const periode = await this.getPeriodeFromKelas(kelasId);
    const status = await this.getRaportStatus(
      sessionUsername,
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
          id_periode_ajar: periode,
          id_siswa: siswaId,
        },
      },
      create: {
        id_periode_ajar: periode,
        id_siswa: siswaId,
        status: 'DIKONFIRMASI',
      },
      update: {
        status: 'DIKONFIRMASI',
      },
    });
  }

  private async ensureSiswaInKelas(kelasId: string, siswaId: string) {
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

  async getAnggota(sessionUsername: string, kelasId: string, siswaId: string) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.siswa.findUnique({
      where: {
        id_siswa: siswaId,
      },
      select: {
        id_siswa: true,
        NIS: true,
        NISN: true,
        nama: true,
      },
    });
    if (!result) this.throwNotFound();

    return result;
  }

  private async getPeriodeFromKelas(kelasId: string) {
    const result = await this.prismaClient.kelas.findUnique({
      where: {
        id_kelas: kelasId,
      },
      select: {
        id_periode_ajar: true,
      },
    });
    if (!result) this.throwNotFound();
    return result.id_periode_ajar;
  }

  async getKehadiran(
    sessionUsername: string,
    kelasId: string,
    siswaId: string
  ) {
    await this.ensureAccess(sessionUsername, kelasId);
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.raport.findUnique({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: await this.getPeriodeFromKelas(kelasId),
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
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const periodeId = await this.getPeriodeFromKelas(kelasId);
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
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.raport.findUnique({
      where: {
        id_periode_ajar_id_siswa: {
          id_periode_ajar: await this.getPeriodeFromKelas(kelasId),
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
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const periodeId = await this.getPeriodeFromKelas(kelasId);
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
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.prestasi.findMany({
      where: {
        id_periode_ajar: await this.getPeriodeFromKelas(kelasId),
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
    await this.ensureSiswaInKelas(kelasId, result.id_siswa);
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
    await this.ensureSiswaInKelas(kelasId, siswaId);

    const result = await this.prismaClient.prestasi.create({
      data: {
        id_periode_ajar: await this.getPeriodeFromKelas(kelasId),
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
