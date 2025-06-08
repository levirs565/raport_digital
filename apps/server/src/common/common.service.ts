import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommonService {
  constructor(private readonly prismaClient: PrismaService) {}

  async getAllPeriodeAjar() {
    return this.prismaClient.periode_Ajar.findMany({
      orderBy: [
        {
          tahunAjar: 'desc',
        },
        {
          semester: 'desc',
        },
      ],
    });
  }

  async getSiswaList(periodeAjarId: string, filter: string | undefined, limit: number) {
    return (
      await this.prismaClient.siswa.findMany({
        take: limit,
        where: {
          nama: {
            contains: filter,
          },
        },
        orderBy: [
          {
            NIS: 'asc',
          },
        ],
        select: {
          id_siswa: true,
          nama: true,
          NIS: true,
          NISN: true,
          Kelas: {
            take: 1,
            where: {
              Kelas: {
                id_periode_ajar: periodeAjarId
              }
            },
            select: {
              Kelas: {
                select: {
                  id_kelas: true,
                  kelas: true,
                  kode_ruang_kelas: true,
                },
              },
            },
          },
        },
      })
    ).map(({ Kelas, ...Siswa }) => ({
      ...Siswa,
      kelas: Kelas.at(0)?.Kelas,
    }));
  }
}
