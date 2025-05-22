-- CreateTable
CREATE TABLE `Periode_Ajar` (
    `id_periode_ajar` VARCHAR(36) NOT NULL,
    `tahunAjar` INTEGER NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,

    PRIMARY KEY (`id_periode_ajar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
