import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import pdfmake from 'pdfmake';
import { CommonUtilsService } from '../common/common.utils.service';
import { $Enums, Status_Raport } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { formatDate } from 'date-fns';
import { RaportType } from '../types';
import { Content } from 'pdfmake/interfaces';
import { TandaTanganService } from '../tanda-tangan/tanda-tangan.service';
import { imageSize } from 'image-size';

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
  'Noto Sans Symbols 2': {
    normal: eval(
      "require.resolve('@fontsource/noto-sans-symbols-2/files/noto-sans-symbols-2-symbols-400-normal.woff')"
    ),
  },
});

@Injectable()
export class RaportService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly tandaTanganService: TandaTanganService
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

  private async getTandaTanganWaliKelas(
    status: Status_Raport,
    username: string
  ) {
    if (status != 'MENUNGGU_KONFIRMASI')
      return await this.tandaTanganService.get(username);
    return null;
  }

  private async getTandaTanganKepalaSekolah(
    status: Status_Raport,
    username: string
  ) {
    if (status == 'DIVERIFIKASI')
      return await this.tandaTanganService.get(username);
    return null;
  }

  private async getIdentitasRaportPDF(kelasId: string, siswaId: string) {
    const [siswa, kepalaSekolah] = await Promise.all([
      this.prismaClient.siswa.findUnique({
        where: {
          id_siswa: siswaId,
        },
      }),
      this.prismaClient.kepala_Sekolah.findFirst(),
    ]);
    if (siswa == null) return null;
    if (!kepalaSekolah) return null;

    const tandaTanganKepalaSekolah = await this.getTandaTanganKepalaSekolah(
      (
        await this.getRaportStatus(kelasId, siswaId)
      ).status,
      kepalaSekolah.username
    );

    return await pdfPrinter.createPdfKitDocument({
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 12,
      },
      pageSize: 'A4',
      content: [
        {
          text: 'IDENTITAS PESERTA DIDIK',
          alignment: 'center',
          lineHeight: 1.5,
          bold: true,
          fontSize: 16,
        },
        {
          layout: 'noBorders',
          table: {
            headerRows: 0,
            widths: ['4%', '25%', '2%', '*'],
            body: [
              ['1. ', 'Nama Peserta Didik', ':', siswa.nama],
              ['2. ', 'NIS', ':', siswa.NIS],
              ['3. ', 'NISN', ':', siswa.NISN],
              [
                '4. ',
                'Tempat Tanggal Lahir',
                ':',
                `${siswa.tempat_lahir}, ${formatDate(
                  siswa.tgl_lahir,
                  'dd-MM-yyyy'
                )}`,
              ],
              ['5. ', 'Jenis Kelamin', ':', siswa.jenis_kelamin],
              ['6. ', 'Agama', ':', siswa.agama],
              ['7. ', 'Status dalam Keluarga', ':', siswa.status_dlm_keluarga],
              ['8. ', 'Anak Ke', ':', siswa.anak_ke.toString()],
              ['9. ', 'Alamat Peserta Didik', ':', siswa.alamat],
              ['10. ', 'Nomor Telepon Rumah/HP', ':', siswa.no_telp],
              ['11. ', 'Sekolah Asal', ':', siswa.sekolah_asal],
              ['12. ', 'Diterima di sekolah ini', ':', ''],
              ['', 'a. Di kelas', ':', siswa.tingkat_diterima.toString()],
              [
                '',
                'b. Pada tanggal',
                ':',
                formatDate(siswa.tgl_diterima, 'dd-MM-yyyy'),
              ],
              ['13. ', 'Nama Orang Tua', ':', ''],
              ['', 'a. Ayah', ':', siswa.nama_ayah],
              ['', 'b. Ibu', ':', siswa.nama_ibu],
              ['14. ', 'Alamat Orang Tua', ':', siswa.alamat_ortu],
              ['15. ', 'Pekerjaan Orang Tua', ':', siswa.nama],
              ['', 'a. Ayah', ':', siswa.pekerjaan_ayah],
              ['', 'b. Ibu', ':', siswa.pekerjaan_ibu],
              ['16. ', 'Nama Wali Siswa', ':', siswa.nama_wali],
              ['', 'a. Pekerjaan Wali', ':', siswa.pekerjaan_wali],
              ['', 'b. Alamat Wali Siswa', ':', siswa.alamat_wali],
            ],
          },
        },
        { text: '\n' },
        {
          layout: 'noBorders',
          unbreakable: true,
          table: {
            widths: ['*', '25%', '*'],
            body: [
              [{}, 'Mengetahui\nKepala Madrasah', {}],
              [{}, this.renderTandaTangan(tandaTanganKepalaSekolah), {}],
              [{}, kepalaSekolah.nama_lengkap, {}],
              [{}, `NIP. ${kepalaSekolah.NIP ?? '-'}`, {}],
            ],
          },
        },
      ],
    });
  }

  private generateIdentitasHeader({
    nama,
    NIS,
    NISN,
    kelas,
    kodeRuangKelas,
    semester,
    tahunAjar,
  }: {
    nama: string;
    NIS: string;
    NISN: string;
    kelas: number;
    kodeRuangKelas: string;
    semester: $Enums.Semester;
    tahunAjar: number;
  }): Content[] {
    const marginHorizontal = 40;
    const pageWidth = 595.28;
    return [
      {
        layout: 'noBorders',
        table: {
          headerRows: 0,
          widths: ['14%', '2%', '*', '18%', '2%', '*'],
          body: [
            ['NAMA', ':', nama, 'Kelas', ':', `${kelas}-${kodeRuangKelas}`],
            ['NIS/NISN', ':', `${NIS}/${NISN}`, 'Fase', ':', 'D'],
            [
              'Madrasah',
              ':',
              '-',
              'Semester',
              ':',
              semester == 'GANJIL' ? 'Genjil' : 'Genap',
            ],
            [
              'Alamat',
              ':',
              '-',
              'Tahun Ajaran',
              ':',
              `${tahunAjar}/${tahunAjar + 1}`,
            ],
          ],
        },
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 5,
            x2: pageWidth - 2 * marginHorizontal,
            y2: 5,
            lineWidth: 1,
          },
        ],
      },
      {
        text: '\n',
      },
    ];
  }

  private renderTandaTangan(image: Buffer | null): Content {
    const height = 60;
    if (!image)
      return {
        text: '',
        fontSize: 0,
        marginBottom: height,
      };
    const size = imageSize(image);
    const width = (size.width / size.height) * height;

    return {
      image: `data:image/png;base64,${image.toString('base64')}`,
      width: width,
      height: height,
    };
  }

  private async getAkademikRaportPDF(kelasId: string, siswaId: string) {
    const rekap = await this.getRekapNilai(kelasId, siswaId);
    if (rekap == null) return null;

    const [data, kepalaSekolah] = await Promise.all([
      this.prismaClient.siswa.findUnique({
        where: {
          id_siswa: siswaId,
        },
        select: {
          nama: true,
          NIS: true,
          NISN: true,
          Prestasi: {
            where: {
              id_periode_ajar: rekap.id_periode_ajar,
            },
            select: {
              jenis: true,
              keterangan: true,
            },
          },
          Raport: {
            where: {
              id_periode_ajar: rekap.id_periode_ajar,
            },
            select: {
              sakit_hari: true,
              izin_hari: true,
              alpa_hari: true,
              catatan_wali_kelas: true,
            },
          },
          Kelas: {
            where: {
              id_kelas: kelasId,
            },
            select: {
              Kelas: {
                select: {
                  Wali_Kelas: {
                    select: {
                      username: true,
                      NIP: true,
                      nama_lengkap: true,
                    },
                  },
                  kelas: true,
                  kode_ruang_kelas: true,
                  Periode_Ajar: {
                    select: {
                      tahunAjar: true,
                      semester: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prismaClient.kepala_Sekolah.findFirst(),
    ]);
    const status = (await this.getRaportStatus(kelasId, siswaId)).status;
    if (!data) return null;
    const kelas = data.Kelas.at(0)?.Kelas;
    if (!kelas) return null;
    if (!kepalaSekolah) return null;

    const tandaTanganWaliKelas = await this.getTandaTanganWaliKelas(
      status,
      kelas.Wali_Kelas.username
    );
    const tandaTanganKepalaSekolah = await this.getTandaTanganKepalaSekolah(
      status,
      kepalaSekolah.username
    );

    return await pdfPrinter.createPdfKitDocument({
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 12,
      },
      pageSize: 'A4',
      content: [
        ...this.generateIdentitasHeader({
          nama: data.nama,
          NIS: data.NIS,
          NISN: data.NISN,
          kelas: kelas.kelas,
          kodeRuangKelas: kelas.kode_ruang_kelas,
          tahunAjar: kelas.Periode_Ajar.tahunAjar,
          semester: kelas.Periode_Ajar.semester,
        }),
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
                  alignment: 'center',
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
              ...(rekap.ekstrakurikuler.length == 0
                ? [[{ text: '1' }, {}, {}, {}]]
                : rekap.ekstrakurikuler.map((ekstrakurikuler, index) => [
                    { text: (index + 1).toString(), alignment: 'center' },
                    { text: ekstrakurikuler.nama },
                    { text: ekstrakurikuler.nilai },
                    { text: ekstrakurikuler.keterangan },
                  ])),
            ],
          },
        },
        { text: '\n' },
        { text: 'Ekstrakurikuler', lineHeight: 1.5 },
        {
          table: {
            headerRows: 1,
            widths: [20, 150, '*'],
            body: [
              [
                { text: 'No', alignment: 'center' },
                { text: 'Jenis Prestasi', alignment: 'center' },
                { text: 'Keterangan', alignment: 'center' },
              ],
              ...(data.Prestasi.length == 0
                ? [[{ text: '1' }, {}, {}]]
                : data.Prestasi.map((prestasi, index) => [
                    { text: (index + 1).toString(), alignment: 'center' },
                    { text: prestasi.jenis },
                    { text: prestasi.keterangan },
                  ])),
            ],
          },
        },
        { text: '\n' },
        { text: 'Ketidakhadiran', lineHeight: 1.5 },
        {
          table: {
            widths: [170, 50, '*'],
            body: [
              [
                { text: 'Sakit' },
                {
                  text: (data.Raport.at(0)?.sakit_hari ?? 0).toString(),
                  alignment: 'center',
                },
                { text: 'Hari' },
              ],
              [
                { text: 'Izin' },
                {
                  text: (data.Raport.at(0)?.izin_hari ?? 0).toString(),
                  alignment: 'center',
                },
                { text: 'Hari' },
              ],
              [
                { text: 'Alpa' },
                {
                  text: (data.Raport.at(0)?.alpa_hari ?? 0).toString(),
                  alignment: 'center',
                },
                { text: 'Hari' },
              ],
            ],
          },
        },
        { text: '\n' },
        { text: 'Catatan Wali Kelas', lineHeight: 1.5 },
        {
          table: {
            widths: ['100%'],
            body: [[data.Raport.at(0)?.catatan_wali_kelas ?? '']],
          },
        },
        {
          text: '\n',
        },
        {
          unbreakable: true,
          stack: [
            {
              layout: 'noBorders',
              unbreakable: true,
              table: {
                widths: ['5%', '25%', '*', '25%', '5%'],
                body: [
                  [
                    {},
                    {},
                    {},
                    { text: formatDate(new Date(), 'dd-MM-yyyy') },
                    {},
                  ],
                  [{}, 'Orang Tua/Wali', {}, 'Wali Kelas', {}],
                  [
                    {},
                    this.renderTandaTangan(null),
                    {},
                    this.renderTandaTangan(tandaTanganWaliKelas),
                    {},
                  ],
                  [{}, { text: '...' }, {}, kelas.Wali_Kelas.nama_lengkap, {}],
                  [{}, {}, {}, `NIP. ${kelas.Wali_Kelas.NIP ?? '-'}`, {}],
                ],
              },
            },
            {
              layout: 'noBorders',
              unbreakable: true,
              table: {
                widths: ['*', '25%', '*'],
                body: [
                  [{}, 'Mengetahui\nKepala Madrasah', {}],
                  [{}, this.renderTandaTangan(tandaTanganKepalaSekolah), {}],
                  [{}, kepalaSekolah.nama_lengkap, {}],
                  [{}, `NIP. ${kepalaSekolah.NIP ?? '-'}`, {}],
                ],
              },
            },
          ],
        },
      ],
    });
  }

  private async getP5RaportPDF(kelasId: string, siswaId: string) {
    await this.commonUtilsService.ensureSiswaInKelas(kelasId, siswaId);
    const [siswa, kelas, kepalaSekolah] = await Promise.all([
      this.prismaClient.siswa.findUnique({
        where: {
          id_siswa: siswaId,
        },
        select: {
          nama: true,
          NIS: true,
          NISN: true,
        },
      }),
      this.prismaClient.kelas.findUnique({
        where: {
          id_kelas: kelasId,
        },
        select: {
          kelas: true,
          kode_ruang_kelas: true,
          Wali_Kelas: {
            select: {
              NIP: true,
              username: true,
              nama_lengkap: true,
            },
          },
          Periode_Ajar: {
            select: {
              tahunAjar: true,
              semester: true,
            },
          },
          Proyek_P5: {
            select: {
              judul: true,
              deskripsi: true,
              Catatan_Proses_P5: {
                where: {
                  id_siswa: siswaId,
                },
                select: {
                  catatan: true,
                },
              },
              Target_P5: {
                include: {
                  Nilai_P5: {
                    where: {
                      id_siswa: siswaId,
                    },
                    select: {
                      nilai: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      this.prismaClient.kepala_Sekolah.findFirst(),
    ]);
    const status = (await this.getRaportStatus(kelasId, siswaId)).status;
    if (!siswa) return null;
    if (!kelas) return null;
    if (!kepalaSekolah) return null;

    const p5NilaiJenis: {
      title: string;
      body: string;
      value: $Enums.Nilai_P5_Enum;
    }[] = [
      {
        value: 'MULAI_BERKEMBANG',
        title: 'Mulai Berkembang',
        body: 'Peserta didik mulai mengembangkan kemampuan namun belum konsisten',
      },
      {
        value: 'SEDANG_BERKEMBANG',
        title: 'Sedang Berkembang',
        body: 'Peserta didik mulai megembangkan kemampuan',
      },
      {
        value: 'BERKEMBANG_SESUAI_HARAPAN',
        title: 'Berkembang Sesuai Harapan',
        body: 'Peserta didik telah mengembangkan kemampuan hingga berada dalam tahap konsisten',
      },
      {
        value: 'SANGAT_BERKEMBANG',
        title: 'Sangat Berkembang',
        body: 'Peserta didik mengembangkan kemampuan melampaui harapan',
      },
    ];
    const checkmark = '✓';
    const tandaTanganWaliKelas = await this.getTandaTanganWaliKelas(
      status,
      kelas.Wali_Kelas.username
    );
    const tandaTanganKepalaSekolah = await this.getTandaTanganKepalaSekolah(
      status,
      kepalaSekolah.username
    );

    return pdfPrinter.createPdfKitDocument({
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 12,
      },
      pageSize: 'A4',
      content: [
        ...this.generateIdentitasHeader({
          nama: siswa.nama,
          NIS: siswa.NIS,
          NISN: siswa.NISN,
          kelas: kelas.kelas,
          kodeRuangKelas: kelas.kode_ruang_kelas,
          tahunAjar: kelas.Periode_Ajar.tahunAjar,
          semester: kelas.Periode_Ajar.semester,
        }),
        {
          text: 'RAPORT PROYEK PENGUATAN PROFIL\nPELAJAR PANCASILA RAHMATAN LIL ALAMIN',
          alignment: 'center',
          lineHeight: 1.5,
          bold: true,
          fontSize: 16,
        },
        ...kelas.Proyek_P5.map((proyek, index) => [
          {
            text: `Projek ${index + 1} | ${proyek.judul}`,
            bold: true,
          },
          {
            text: proyek.deskripsi,
          },
          {
            text: '\n',
          },
        ]),
        {
          layout: 'noBorders',
          table: {
            body: [
              p5NilaiJenis.map((jenis) => ({ text: jenis.title, bold: true })),
              p5NilaiJenis.map((jenis) => ({ text: jenis.body })),
            ],
          },
        },
        {
          text: '\n',
        },
        ...kelas.Proyek_P5.flatMap((proyek, index) => [
          {
            table: {
              widths: ['35%', '*', '*', '*', '*'],
              headerRows: 1,
              body: [
                [
                  { text: `Proyek ${index} ${proyek.judul}`, bold: true },
                  ...p5NilaiJenis.map((nilai) => ({
                    text: nilai.title,
                    bold: true,
                  })),
                ],
                ...proyek.Target_P5.flatMap((target) => {
                  const nilai = target.Nilai_P5.at(0)?.nilai;
                  return [
                    [
                      { text: target.dimensi, bold: true, colSpan: 3 },
                      {},
                      {},
                      {},
                      {},
                    ],
                    [
                      {
                        text: [
                          { text: `${target.subelemen}. `, bold: true },
                          { text: target.target },
                        ],
                      },
                      ...p5NilaiJenis.map((jenis) => ({
                        text: nilai == jenis.value ? checkmark : '',
                        font: 'Noto Sans Symbols 2',
                      })),
                    ],
                  ];
                }),
              ],
            },
          },
          {
            text: '\n',
          },
        ]),
        {
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: [
                    { text: 'Catatan Proses: \n\n', bold: true },
                    kelas.Proyek_P5.map(
                      (proyek) => proyek.Catatan_Proses_P5.at(0)?.catatan ?? ''
                    ).join('\n'),
                  ],
                },
              ],
            ],
          },
        },
        {
          text: '\n',
        },
        {
          layout: 'noBorders',
          unbreakable: true,
          table: {
            widths: ['5%', '25%', '*', '25%', '5%'],
            body: [
              [
                {},
                'Mengetahui',
                {},
                { text: formatDate(new Date(), 'dd-MM-yyyy') },
                {},
              ],
              [{}, 'Kepala Madrasah', {}, 'Wali Kelas', {}],
              [
                {},
                this.renderTandaTangan(tandaTanganKepalaSekolah),
                {},
                this.renderTandaTangan(tandaTanganWaliKelas),
                {},
              ],
              [
                {},
                kepalaSekolah.nama_lengkap,
                {},
                kelas.Wali_Kelas.nama_lengkap,
                {},
              ],
              [{}, {}, {}, `NIP. ${kelas.Wali_Kelas.NIP ?? '-'}`, {}],
            ],
          },
        },
      ],
    });
  }

  async getRaportPDF(
    kelasId: string,
    siswaId: string,
    type: RaportType
  ): Promise<string | null> {
    const doc =
      type == 'IDENTITAS'
        ? await this.getIdentitasRaportPDF(kelasId, siswaId)
        : type == 'AKADEMIK'
        ? await this.getAkademikRaportPDF(kelasId, siswaId)
        : await this.getP5RaportPDF(kelasId, siswaId);
    if (doc == null) return null;
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
