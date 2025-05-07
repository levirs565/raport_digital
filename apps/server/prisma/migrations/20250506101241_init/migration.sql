-- CreateTable
CREATE TABLE `Akun` (
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `type` ENUM('OPERATOR', 'GURU', 'KEPALA_SEKOLAH') NOT NULL,

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guru` (
    `username` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `NIP` VARCHAR(191) NOT NULL,
    `tanda_tangan` VARCHAR(191) NOT NULL,
    `is_verified` BOOLEAN NOT NULL,

    UNIQUE INDEX `Guru_NIP_key`(`NIP`),
    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kepala_Sekolah` (
    `username` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `NIP` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Kepala_Sekolah_NIP_key`(`NIP`),
    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Guru` ADD CONSTRAINT `Guru_username_fkey` FOREIGN KEY (`username`) REFERENCES `Akun`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kepala_Sekolah` ADD CONSTRAINT `Kepala_Sekolah_username_fkey` FOREIGN KEY (`username`) REFERENCES `Akun`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;
