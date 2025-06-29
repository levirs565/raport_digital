import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { isRaportLocked } from '../utils';
import { CommonUtilsService } from './common.utils.service';

@Injectable()
export class CommonService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly commonUtilsService: CommonUtilsService
  ) {}

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

  async getSiswaList(
    periodeAjarId: string,
    filter: string | undefined,
    limit: number
  ) {
    return (
      await this.prismaClient.siswa.findMany({
        take: limit,
        where: this.commonUtilsService.createSiswaFilter(filter),
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
          Raport: {
            where: {
              id_periode_ajar: periodeAjarId,
            },
            take: 1,
            select: {
              status: true,
            },
          },
          Kelas: {
            take: 1,
            where: {
              Kelas: {
                id_periode_ajar: periodeAjarId,
              },
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
    ).map(({ Kelas, Raport, ...Siswa }) => ({
      ...Siswa,
      kelas: Kelas.at(0)?.Kelas,
      is_locked: isRaportLocked(Raport.at(0)?.status),
    }));
  }
}
