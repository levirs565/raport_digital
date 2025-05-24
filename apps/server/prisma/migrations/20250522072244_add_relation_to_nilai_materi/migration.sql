-- AddForeignKey
ALTER TABLE `Nilai_Materi` ADD CONSTRAINT `Nilai_Materi_id_materi_fkey` FOREIGN KEY (`id_materi`) REFERENCES `Materi`(`id_materi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nilai_Materi` ADD CONSTRAINT `Nilai_Materi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;
