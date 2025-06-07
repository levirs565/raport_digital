import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TandaTanganService } from "./tanda-tangan.service";

@Module({
  imports: [ConfigModule],
  providers: [TandaTanganService],
  exports: [TandaTanganService]
})
export class TandaTanganModule {

}
