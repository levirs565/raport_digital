-- DropForeignKey
ALTER TABLE `materi` DROP FOREIGN KEY `Materi_id_kelas_id_mata_pelajaran_fkey`;

-- DropForeignKey
ALTER TABLE `nilai_materi` DROP FOREIGN KEY `Nilai_Materi_id_materi_fkey`;

-- DropIndex
DROP INDEX `Materi_id_kelas_id_mata_pelajaran_fkey` ON `materi`;

-- AddForeignKey
ALTER TABLE `Materi` ADD CONSTRAINT `Materi_id_kelas_id_mata_pelajaran_fkey` FOREIGN KEY (`id_kelas`, `id_mata_pelajaran`) REFERENCES `Mata_Pelajaran_Kelas`(`id_kelas`, `id_mata_pelajaran`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nilai_Materi` ADD CONSTRAINT `Nilai_Materi_id_materi_fkey` FOREIGN KEY (`id_materi`) REFERENCES `Materi`(`id_materi`) ON DELETE CASCADE ON UPDATE CASCADE;
