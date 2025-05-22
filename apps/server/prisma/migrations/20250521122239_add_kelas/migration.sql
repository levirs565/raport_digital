-- CreateTable
CREATE TABLE `Kelas` (
    `id_kelas` VARCHAR(36) NOT NULL,
    `kelas` INTEGER NOT NULL,
    `kode_ruang_kelas` VARCHAR(191) NOT NULL,
    `username_wali_kelas` VARCHAR(191) NOT NULL,
    `username_koor_p5` VARCHAR(191) NOT NULL,
    `id_periode_ajar` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mata_Pelajaran_Kelas` (
    `id_mata_pelajaran` VARCHAR(36) NOT NULL,
    `username_guru` VARCHAR(191) NOT NULL,
    `id_kelas` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_mata_pelajaran`, `id_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Anggota_Kelas` (
    `id_kelas` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_kelas`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kelas` ADD CONSTRAINT `Kelas_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `Periode_Ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelas` ADD CONSTRAINT `Kelas_username_wali_kelas_fkey` FOREIGN KEY (`username_wali_kelas`) REFERENCES `Guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kelas` ADD CONSTRAINT `Kelas_username_koor_p5_fkey` FOREIGN KEY (`username_koor_p5`) REFERENCES `Guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mata_Pelajaran_Kelas` ADD CONSTRAINT `Mata_Pelajaran_Kelas_id_mata_pelajaran_fkey` FOREIGN KEY (`id_mata_pelajaran`) REFERENCES `Mata_Pelajaran`(`id_mata_pelajaran`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mata_Pelajaran_Kelas` ADD CONSTRAINT `Mata_Pelajaran_Kelas_username_guru_fkey` FOREIGN KEY (`username_guru`) REFERENCES `Guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mata_Pelajaran_Kelas` ADD CONSTRAINT `Mata_Pelajaran_Kelas_id_mata_pelajaran_username_guru_fkey` FOREIGN KEY (`id_mata_pelajaran`, `username_guru`) REFERENCES `Guru_Mata_Pelajaran`(`id_mata_pelajaran`, `username_guru`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Mata_Pelajaran_Kelas` ADD CONSTRAINT `Mata_Pelajaran_Kelas_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `Kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anggota_Kelas` ADD CONSTRAINT `Anggota_Kelas_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `Kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anggota_Kelas` ADD CONSTRAINT `Anggota_Kelas_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;
