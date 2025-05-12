-- CreateTable
CREATE TABLE `Ekstrakurikuler` (
    `id_esktrakurikuler` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `username_guru` VARCHAR(191) NOT NULL,
    `id_periode_ajar` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_esktrakurikuler`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Ekstrakurikuler` ADD CONSTRAINT `Ekstrakurikuler_username_guru_fkey` FOREIGN KEY (`username_guru`) REFERENCES `Guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ekstrakurikuler` ADD CONSTRAINT `Ekstrakurikuler_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `Periode_Ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;
