import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pdfmake from 'pdfmake';
import { CommonUtilsService } from '../common/common.utils.service';
import { Status_Raport } from '@prisma/client';
import { TRPCError } from '@trpc/server';

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
export class RaportService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly commonUtilsService: CommonUtilsService
  ) {}

  async getAllAnggotaKelasAndStatusRaport(kelasId: string) {
    const periodeAjarId = await this.commonUtilsService.getPeriodeFromKelas(
      kelasId
    );
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
            Raport: {
              where: {
                id_periode_ajar: periodeAjarId,
              },
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    return result.map(({ Siswa: { Raport, ...rest } }) => ({
      ...rest,
      status_raport: Raport.at(0)?.status ?? Status_Raport.MENUNGGU_KONFIRMASI,
    }));
  }

  async getAnggotaKelasAndStatusRaport(kelasId: string, siswaId: string) {
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);
    const result = await this.prismaClient.siswa.findUnique({
      where: {
        id_siswa: siswaId,
      },
      select: {
        id_siswa: true,
        NIS: true,
        NISN: true,
        nama: true,
        Raport: {
          where: {
            id_periode_ajar: await this.commonUtilsService.getPeriodeFromKelas(
              kelasId
            ),
          },
          select: {
            status: true,
            alasan_tolak: true,
          },
        },
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Siswa not found',
      });

    const { Raport, ...rest } = result;
    const status = Raport.at(0)?.status ?? 'MENUNGGU_KONFIRMASI';

    return {
      ...rest,
      status,
      alasan_tolak:
        status == 'MENUNGGU_KONFIRMASI'
          ? Raport.at(0)?.alasan_tolak ?? null
          : null,
    };
  }

  async getRaportStatus(kelasId: string, siswaId: string) {
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);

    const periodeId = await this.commonUtilsService.getPeriodeFromKelas(
      kelasId
    );
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
    if (!raport)
      return {
        periodeId,
        status: Status_Raport.MENUNGGU_KONFIRMASI,
      };

    return {
      periodeId,
      status: raport.status,
    };
  }

  private createMataPelajaranDescription(materi: string, nilai: number) {
    if (nilai >= 90)
      return `Menunjukkan penguasaan yang sangat baik dalam ${materi}`;
    if (nilai >= 75) return `Menunjukkan penguasan yang baik dalam ${materi}`;
    return `Perlu pendampingan dalam ${materi}`;
  }

  async getRekapNilai(kelasId: string, siswaId: string) {
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);
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
      id_periode_ajar: kelas.id_periode_ajar,
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

  async changeRaportStatus(kelasId: string, siswaId: string) {}

  async getRaportPDF(kelasId: string, siswaId: string): Promise<string | null> {
    const rekap = await this.getRekapNilai(kelasId, siswaId);
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
}
