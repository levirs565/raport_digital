-- DropForeignKey
ALTER TABLE `guru_mata_pelajaran` DROP FOREIGN KEY `Guru_Mata_Pelajaran_id_mata_pelajaran_fkey`;

-- AddForeignKey
ALTER TABLE `Guru_Mata_Pelajaran` ADD CONSTRAINT `Guru_Mata_Pelajaran_id_mata_pelajaran_fkey` FOREIGN KEY (`id_mata_pelajaran`) REFERENCES `Mata_Pelajaran`(`id_mata_pelajaran`) ON DELETE CASCADE ON UPDATE CASCADE;
