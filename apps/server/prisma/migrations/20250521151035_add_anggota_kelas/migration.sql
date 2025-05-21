-- CreateTable
CREATE TABLE `Anggota_Ekstrakurikuler` (
    `id_ekstrakurikuler` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `nilai` ENUM('SANGAT_BAIK', 'BAIK', 'CUKUP', 'KURANG') NULL,
    `keterangan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_ekstrakurikuler`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Anggota_Ekstrakurikuler` ADD CONSTRAINT `Anggota_Ekstrakurikuler_id_ekstrakurikuler_fkey` FOREIGN KEY (`id_ekstrakurikuler`) REFERENCES `Ekstrakurikuler`(`id_esktrakurikuler`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anggota_Ekstrakurikuler` ADD CONSTRAINT `Anggota_Ekstrakurikuler_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;
