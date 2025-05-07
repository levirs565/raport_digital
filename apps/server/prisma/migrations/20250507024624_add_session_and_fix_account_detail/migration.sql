-- AlterTable
ALTER TABLE `guru` MODIFY `NIP` VARCHAR(191) NULL,
    MODIFY `tanda_tangan` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `kepala_sekolah` ADD COLUMN `tanda_tangan` VARCHAR(191) NULL,
    MODIFY `NIP` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sid_key`(`sid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
