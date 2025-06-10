-- DropForeignKey
ALTER TABLE `catatan_proses_p5` DROP FOREIGN KEY `Catatan_Proses_P5_id_proyek_p5_fkey`;

-- DropForeignKey
ALTER TABLE `mata_pelajaran_kelas` DROP FOREIGN KEY `Mata_Pelajaran_Kelas_id_kelas_fkey`;

-- DropForeignKey
ALTER TABLE `nilai_p5` DROP FOREIGN KEY `Nilai_P5_id_target_p5_fkey`;

-- DropForeignKey
ALTER TABLE `proyek_p5` DROP FOREIGN KEY `Proyek_P5_id_kelas_fkey`;

-- DropForeignKey
ALTER TABLE `target_p5` DROP FOREIGN KEY `Target_P5_id_proyek_p5_fkey`;

-- AddForeignKey
ALTER TABLE `Mata_Pelajaran_Kelas` ADD CONSTRAINT `Mata_Pelajaran_Kelas_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `Kelas`(`id_kelas`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Proyek_P5` ADD CONSTRAINT `Proyek_P5_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `Kelas`(`id_kelas`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catatan_Proses_P5` ADD CONSTRAINT `Catatan_Proses_P5_id_proyek_p5_fkey` FOREIGN KEY (`id_proyek_p5`) REFERENCES `Proyek_P5`(`id_proyek_p5`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Target_P5` ADD CONSTRAINT `Target_P5_id_proyek_p5_fkey` FOREIGN KEY (`id_proyek_p5`) REFERENCES `Proyek_P5`(`id_proyek_p5`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nilai_P5` ADD CONSTRAINT `Nilai_P5_id_target_p5_fkey` FOREIGN KEY (`id_target_p5`) REFERENCES `Target_P5`(`id_target_p5`) ON DELETE CASCADE ON UPDATE CASCADE;
