-- CreateTable
CREATE TABLE `Raport` (
    `id_periode_ajar` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `catatan_wali_kelas` VARCHAR(191) NULL,
    `sakit_hari` INTEGER NOT NULL DEFAULT 0,
    `izin_hari` INTEGER NOT NULL DEFAULT 0,
    `alpa_hari` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('MENUNGGU_KONFIRMASI', 'DIKONFIRMASI', 'DIVERIFIKASI') NOT NULL DEFAULT 'MENUNGGU_KONFIRMASI',
    `alasan_tolak` VARCHAR(191) NULL,

    PRIMARY KEY (`id_periode_ajar`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Prestasi` (
    `id_prestasi` VARCHAR(36) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `id_periode_ajar` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_prestasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Raport` ADD CONSTRAINT `Raport_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `Periode_Ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Raport` ADD CONSTRAINT `Raport_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestasi` ADD CONSTRAINT `Prestasi_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `Periode_Ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestasi` ADD CONSTRAINT `Prestasi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;
