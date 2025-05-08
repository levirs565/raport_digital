-- CreateTable
CREATE TABLE `Guru_Mata_Pelajaran` (
    `id_mata_pelajaran` VARCHAR(191) NOT NULL,
    `username_guru` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_mata_pelajaran`, `username_guru`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guru_Mata_Pelajaran` ADD CONSTRAINT `Guru_Mata_Pelajaran_id_mata_pelajaran_fkey` FOREIGN KEY (`id_mata_pelajaran`) REFERENCES `Mata_Pelajaran`(`id_mata_pelajaran`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Guru_Mata_Pelajaran` ADD CONSTRAINT `Guru_Mata_Pelajaran_username_guru_fkey` FOREIGN KEY (`username_guru`) REFERENCES `Guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
