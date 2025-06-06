import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { RaportService } from "./raport.service";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [PrismaModule, CommonModule],
  providers: [RaportService],
  exports: [RaportService],
})
export class RaportModule {

}
