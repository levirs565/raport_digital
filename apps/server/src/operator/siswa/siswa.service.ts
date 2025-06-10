import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TRPCError } from '@trpc/server';
import { JenisKelamin, Siswa } from '@prisma/client';
import { PrismaHelper } from '../../utils';
import { parse as csvParse } from 'csv-parse';
import { Stream } from 'node:stream';
import { type ReadableStream } from 'node:stream/web';
import { parse as parseDate } from 'date-fns';
import z from 'zod';

export type SiswaOrderBy = 'NIS' | 'Nama';

const csvDate = z.string().transform((input, ctx) => {
  const result = parseDate(input, 'dd/MM/yyyy', new Date());
  if (isNaN(result as any)) {
    ctx.addIssue({
      code: z.ZodIssueCode.invalid_date,
      message: 'Invalid date',
    });
    return z.NEVER;
  }
  return result;
});
const csvNumber = z.string().transform((input, ctx) => {
  const number = parseInt(input);
  if (isNaN(number)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid number',
    });
    return z.NEVER;
  }
  return number;
});
const siswaCsvSchema = z
  .object({
    NIS: z.string(),
    NISN: z.string(),
    Nama: z.string(),
    'Jenis Kelamin': z.enum(['Laki-Laki', 'Perempuan']),
    'Tempat Lahir': z.string(),
    'Tanggal Lahir': csvDate,
    Alamat: z.string(),
    Agama: z.string(),
    'Status Dalam Keluarga': z.string(),
    'Anak Ke': csvNumber,
    'No Telp': z.string(),
    'Sekolah Asal': z.string(),
    'Tanggal Diterima': csvDate,
    'Tingkat Diterima': csvNumber,
    'Nama Ayah': z.string(),
    'Nama Ibu': z.string(),
    'Pekerjaan Ayah': z.string(),
    'Pekerjaan Ibu': z.string(),
    'Alamat Orang Tua': z.string(),
    'Nama Wali': z.string(),
    'Pekerjaan Wali': z.string(),
    'Alamat Wali': z.string(),
  })
  .transform((input) => ({
    NIS: input.NIS,
    NISN: input.NISN,
    nama: input.Nama,
    jenis_kelamin: (input['Jenis Kelamin'] == 'Laki-Laki'
      ? 'LAKI_LAKI'
      : 'PEREMPUAN') satisfies JenisKelamin as JenisKelamin,
    tempat_lahir: input['Tempat Lahir'],
    tgl_lahir: input['Tanggal Lahir'],
    alamat: input.Alamat,
    agama: input.Agama,
    status_dlm_keluarga: input['Status Dalam Keluarga'],
    anak_ke: input['Anak Ke'],
    no_telp: input['No Telp'],
    sekolah_asal: input['Sekolah Asal'],
    tgl_diterima: input['Tanggal Diterima'],
    tingkat_diterima: input['Tingkat Diterima'],
    nama_ayah: input['Nama Ayah'],
    nama_ibu: input['Nama Ibu'],
    pekerjaan_ayah: input['Pekerjaan Ayah'],
    pekerjaan_ibu: input['Pekerjaan Ibu'],
    alamat_ortu: input['Alamat Orang Tua'],
    nama_wali: input['Nama Wali'],
    pekerjaan_wali: input['Pekerjaan Wali'],
    alamat_wali: input['Alamat Wali'],
  }));

@Injectable()
export class OperatorSiswaService {
  constructor(private readonly prismaClient: PrismaService) {}

  private pageSize = 20;
  async getAll(pageIndex: number, orderBy: SiswaOrderBy, asc: boolean) {
    const count = await this.prismaClient.siswa.count();
    const result = await this.prismaClient.siswa.findMany({
      skip: pageIndex * this.pageSize,
      take: this.pageSize,
      orderBy: [
        orderBy == 'NIS'
          ? {
              NIS: asc ? 'asc' : 'desc',
            }
          : {
              nama: asc ? 'asc' : 'desc',
            },
      ],
      select: {
        id_siswa: true,
        nama: true,
        NIS: true,
        NISN: true,
      },
    });

    return {
      page_index: pageIndex,
      page_count: Math.ceil(count / this.pageSize),
      page: result,
    };
  }

  async count() {
    return this.prismaClient.siswa.count();
  }

  async get(id: string) {
    const result = await this.prismaClient.siswa.findUnique({
      where: {
        id_siswa: id,
      },
    });
    if (!result)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Siswa not found',
      });
    return result;
  }

  async add(data: Omit<Siswa, 'id_siswa'>) {
    const result = await this.prismaClient.siswa.create({
      data,
    });

    return result.id_siswa;
  }

  async importCsv(stream: ReadableStream) {
    const result: ({ id: string } | { error: string })[] = [];
    let globalError: string | undefined = undefined;

    function mapError(e: any) {
      return e.message ?? 'Undefined error';
    }

    try {
      const nodeStream = Stream.Readable.fromWeb(stream);
      const parser = nodeStream.pipe(
        csvParse({
          columns: true,
        })
      );
      for await (const record of parser) {
        const siswa = await siswaCsvSchema.safeParseAsync(record);
        if (siswa.error) {
          result.push({
            error: siswa.error.message,
          });
          continue;
        }
        try {
          const id = await this.add(siswa.data!);
          result.push({ id });
        } catch (e) {
          result.push({ error: mapError(e) });
        }
      }
    } catch (e) {
      globalError = mapError(e);
    }

    return {
      error: globalError,
      list: result,
    };
  }

  async update({ id_siswa, ...data }: Siswa) {
    try {
      await this.prismaClient.siswa.update({
        data,
        where: {
          id_siswa,
        },
      });
    } catch (e) {
      if (PrismaHelper.isRecordNotFoundError(e)) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Siswa not found',
        });
      } else throw e;
    }
  }
}
