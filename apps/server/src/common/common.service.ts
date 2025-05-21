import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CommonService {
  constructor(
    private readonly prismaClient: PrismaService
  ) { }

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

  async getSiswaList(filter: string | undefined, limit: number) {
    return this.prismaClient.siswa.findMany({
      take: limit,
      where: {
        nama: {
          contains: filter
        }
      },
      orderBy: [{
        NIS: "asc"
      }],
      select: {
        id_siswa: true,
        nama: true,
        NIS: true,
        NISN: true,
      },
    })
  }
}
