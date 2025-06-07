-- AddForeignKey
ALTER TABLE `Nilai_P5` ADD CONSTRAINT `Nilai_P5_id_target_p5_fkey` FOREIGN KEY (`id_target_p5`) REFERENCES `Target_P5`(`id_target_p5`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nilai_P5` ADD CONSTRAINT `Nilai_P5_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;
