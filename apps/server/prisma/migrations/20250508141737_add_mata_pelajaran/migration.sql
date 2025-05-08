-- CreateTable
CREATE TABLE `Mata_Pelajaran` (
    `id_mata_pelajaran` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kelompok_mapel` VARCHAR(191) NULL,
    `id_periode_ajar` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_mata_pelajaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mata_Pelajaran` ADD CONSTRAINT `Mata_Pelajaran_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `Periode_Ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;
