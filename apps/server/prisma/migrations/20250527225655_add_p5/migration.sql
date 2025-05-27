-- CreateTable
CREATE TABLE `Proyek_P5` (
    `id_proyek_p5` VARCHAR(36) NOT NULL,
    `tema` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `id_kelas` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_proyek_p5`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Catatan_Proses_P5` (
    `id_proyek_p5` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `catatan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_proyek_p5`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Target_P5` (
    `id_target_p5` VARCHAR(36) NOT NULL,
    `dimensi` VARCHAR(191) NOT NULL,
    `elemen` VARCHAR(191) NOT NULL,
    `subelemen` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `id_proyek_p5` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_target_p5`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Nilai_P5` (
    `id_target_p5` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `nilai` VARCHAR(191) NULL,

    PRIMARY KEY (`id_target_p5`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Proyek_P5` ADD CONSTRAINT `Proyek_P5_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `Kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catatan_Proses_P5` ADD CONSTRAINT `Catatan_Proses_P5_id_proyek_p5_fkey` FOREIGN KEY (`id_proyek_p5`) REFERENCES `Proyek_P5`(`id_proyek_p5`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Catatan_Proses_P5` ADD CONSTRAINT `Catatan_Proses_P5_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `Siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Target_P5` ADD CONSTRAINT `Target_P5_id_proyek_p5_fkey` FOREIGN KEY (`id_proyek_p5`) REFERENCES `Proyek_P5`(`id_proyek_p5`) ON DELETE RESTRICT ON UPDATE CASCADE;
