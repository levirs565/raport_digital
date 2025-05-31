/*
  Warnings:

  - You are about to alter the column `nilai` on the `nilai_p5` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.

*/
-- AlterTable
ALTER TABLE `nilai_p5` MODIFY `nilai` ENUM('MULAI_BERKEMBANG', 'SEDANG_BERKEMBANG', 'BERKEMBANG_SESUAI_HARAPAN', 'SANGAT_BERKEMBANG') NULL;
