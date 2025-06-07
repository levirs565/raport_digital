import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RaportService } from "./raport.service";
import { CommonModule } from "../common/common.module";
import { TandaTanganModule } from "../tanda-tangan/tanda-tangan.module";

@Module({
  imports: [PrismaModule, CommonModule, TandaTanganModule],
  providers: [RaportService],
  exports: [RaportService],
})
export class RaportModule {

}
