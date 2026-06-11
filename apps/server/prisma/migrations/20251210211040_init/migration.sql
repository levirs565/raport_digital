-- CreateTable
CREATE TABLE `akun` (
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `type` ENUM('OPERATOR', 'GURU', 'KEPALA_SEKOLAH') NOT NULL,

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru` (
    `username` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `NIP` VARCHAR(191) NULL,
    `tanda_tangan` VARCHAR(191) NULL,
    `is_verified` BOOLEAN NOT NULL,

    UNIQUE INDEX `guru_NIP_key`(`NIP`),
    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kepala_sekolah` (
    `username` VARCHAR(191) NOT NULL,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `NIP` VARCHAR(191) NULL,
    `tanda_tangan` VARCHAR(191) NULL,

    UNIQUE INDEX `kepala_sekolah_NIP_key`(`NIP`),
    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `session_sid_key`(`sid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `periode_ajar` (
    `id_periode_ajar` VARCHAR(36) NOT NULL,
    `tahunAjar` INTEGER NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,

    PRIMARY KEY (`id_periode_ajar`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mata_pelajaran` (
    `id_mata_pelajaran` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `kelompok_mapel` VARCHAR(191) NULL,
    `id_periode_ajar` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_mata_pelajaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guru_mata_pelajaran` (
    `id_mata_pelajaran` VARCHAR(191) NOT NULL,
    `username_guru` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_mata_pelajaran`, `username_guru`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id_siswa` VARCHAR(36) NOT NULL,
    `NIS` VARCHAR(191) NOT NULL,
    `NISN` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `jenis_kelamin` ENUM('LAKI_LAKI', 'PEREMPUAN') NOT NULL,
    `tempat_lahir` VARCHAR(191) NOT NULL,
    `tgl_lahir` DATE NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `agama` VARCHAR(191) NOT NULL,
    `status_dlm_keluarga` VARCHAR(191) NOT NULL,
    `anak_ke` INTEGER NOT NULL,
    `no_telp` VARCHAR(191) NOT NULL,
    `sekolah_asal` VARCHAR(191) NOT NULL,
    `tgl_diterima` DATE NOT NULL,
    `tingkat_diterima` INTEGER NOT NULL,
    `nama_ayah` VARCHAR(191) NOT NULL,
    `nama_ibu` VARCHAR(191) NOT NULL,
    `pekerjaan_ayah` VARCHAR(191) NOT NULL,
    `pekerjaan_ibu` VARCHAR(191) NOT NULL,
    `alamat_ortu` VARCHAR(191) NOT NULL,
    `nama_wali` VARCHAR(191) NOT NULL,
    `pekerjaan_wali` VARCHAR(191) NOT NULL,
    `alamat_wali` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `siswa_NIS_key`(`NIS`),
    UNIQUE INDEX `siswa_NISN_key`(`NISN`),
    PRIMARY KEY (`id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ekstrakurikuler` (
    `id_esktrakurikuler` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `username_guru` VARCHAR(191) NOT NULL,
    `id_periode_ajar` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_esktrakurikuler`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id_kelas` VARCHAR(36) NOT NULL,
    `kelas` INTEGER NOT NULL,
    `kode_ruang_kelas` VARCHAR(191) NOT NULL,
    `username_wali_kelas` VARCHAR(191) NOT NULL,
    `username_koor_p5` VARCHAR(191) NOT NULL,
    `id_periode_ajar` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mata_pelajaran_kelas` (
    `id_mata_pelajaran` VARCHAR(36) NOT NULL,
    `username_guru` VARCHAR(191) NOT NULL,
    `id_kelas` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_mata_pelajaran`, `id_kelas`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anggota_kelas` (
    `id_kelas` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_kelas`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anggota_ekstrakurikuler` (
    `id_ekstrakurikuler` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `nilai` ENUM('SANGAT_BAIK', 'BAIK', 'CUKUP', 'KURANG') NULL,
    `keterangan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_ekstrakurikuler`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materi` (
    `id_materi` VARCHAR(36) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NOT NULL,
    `id_mata_pelajaran` VARCHAR(36) NOT NULL,
    `id_kelas` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_materi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_materi` (
    `id_materi` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `nilai` INTEGER NOT NULL,

    PRIMARY KEY (`id_materi`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proyek_p5` (
    `id_proyek_p5` VARCHAR(36) NOT NULL,
    `tema` VARCHAR(191) NOT NULL,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` VARCHAR(191) NOT NULL,
    `id_kelas` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_proyek_p5`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `catatan_proses_p5` (
    `id_proyek_p5` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `catatan` VARCHAR(191) NULL,

    PRIMARY KEY (`id_proyek_p5`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `target_p5` (
    `id_target_p5` VARCHAR(36) NOT NULL,
    `dimensi` VARCHAR(191) NOT NULL,
    `elemen` VARCHAR(191) NOT NULL,
    `subelemen` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `id_proyek_p5` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_target_p5`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_p5` (
    `id_target_p5` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,
    `nilai` ENUM('MULAI_BERKEMBANG', 'SEDANG_BERKEMBANG', 'BERKEMBANG_SESUAI_HARAPAN', 'SANGAT_BERKEMBANG') NULL,

    PRIMARY KEY (`id_target_p5`, `id_siswa`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raport` (
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
CREATE TABLE `prestasi` (
    `id_prestasi` VARCHAR(36) NOT NULL,
    `jenis` VARCHAR(191) NOT NULL,
    `keterangan` VARCHAR(191) NOT NULL,
    `id_periode_ajar` VARCHAR(36) NOT NULL,
    `id_siswa` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id_prestasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `guru` ADD CONSTRAINT `guru_username_fkey` FOREIGN KEY (`username`) REFERENCES `akun`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kepala_sekolah` ADD CONSTRAINT `kepala_sekolah_username_fkey` FOREIGN KEY (`username`) REFERENCES `akun`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_pelajaran` ADD CONSTRAINT `mata_pelajaran_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `periode_ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mata_pelajaran` ADD CONSTRAINT `guru_mata_pelajaran_id_mata_pelajaran_fkey` FOREIGN KEY (`id_mata_pelajaran`) REFERENCES `mata_pelajaran`(`id_mata_pelajaran`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guru_mata_pelajaran` ADD CONSTRAINT `guru_mata_pelajaran_username_guru_fkey` FOREIGN KEY (`username_guru`) REFERENCES `guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ekstrakurikuler` ADD CONSTRAINT `ekstrakurikuler_username_guru_fkey` FOREIGN KEY (`username_guru`) REFERENCES `guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ekstrakurikuler` ADD CONSTRAINT `ekstrakurikuler_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `periode_ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `periode_ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_username_wali_kelas_fkey` FOREIGN KEY (`username_wali_kelas`) REFERENCES `guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_username_koor_p5_fkey` FOREIGN KEY (`username_koor_p5`) REFERENCES `guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_pelajaran_kelas` ADD CONSTRAINT `mata_pelajaran_kelas_id_mata_pelajaran_fkey` FOREIGN KEY (`id_mata_pelajaran`) REFERENCES `mata_pelajaran`(`id_mata_pelajaran`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_pelajaran_kelas` ADD CONSTRAINT `mata_pelajaran_kelas_username_guru_fkey` FOREIGN KEY (`username_guru`) REFERENCES `guru`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_pelajaran_kelas` ADD CONSTRAINT `mata_pelajaran_kelas_id_mata_pelajaran_username_guru_fkey` FOREIGN KEY (`id_mata_pelajaran`, `username_guru`) REFERENCES `guru_mata_pelajaran`(`id_mata_pelajaran`, `username_guru`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mata_pelajaran_kelas` ADD CONSTRAINT `mata_pelajaran_kelas_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_kelas` ADD CONSTRAINT `anggota_kelas_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_kelas` ADD CONSTRAINT `anggota_kelas_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_ekstrakurikuler` ADD CONSTRAINT `anggota_ekstrakurikuler_id_ekstrakurikuler_fkey` FOREIGN KEY (`id_ekstrakurikuler`) REFERENCES `ekstrakurikuler`(`id_esktrakurikuler`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `anggota_ekstrakurikuler` ADD CONSTRAINT `anggota_ekstrakurikuler_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `materi` ADD CONSTRAINT `materi_id_kelas_id_mata_pelajaran_fkey` FOREIGN KEY (`id_kelas`, `id_mata_pelajaran`) REFERENCES `mata_pelajaran_kelas`(`id_kelas`, `id_mata_pelajaran`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_materi` ADD CONSTRAINT `nilai_materi_id_materi_fkey` FOREIGN KEY (`id_materi`) REFERENCES `materi`(`id_materi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_materi` ADD CONSTRAINT `nilai_materi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proyek_p5` ADD CONSTRAINT `proyek_p5_id_kelas_fkey` FOREIGN KEY (`id_kelas`) REFERENCES `kelas`(`id_kelas`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catatan_proses_p5` ADD CONSTRAINT `catatan_proses_p5_id_proyek_p5_fkey` FOREIGN KEY (`id_proyek_p5`) REFERENCES `proyek_p5`(`id_proyek_p5`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `catatan_proses_p5` ADD CONSTRAINT `catatan_proses_p5_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `target_p5` ADD CONSTRAINT `target_p5_id_proyek_p5_fkey` FOREIGN KEY (`id_proyek_p5`) REFERENCES `proyek_p5`(`id_proyek_p5`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_p5` ADD CONSTRAINT `nilai_p5_id_target_p5_fkey` FOREIGN KEY (`id_target_p5`) REFERENCES `target_p5`(`id_target_p5`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_p5` ADD CONSTRAINT `nilai_p5_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raport` ADD CONSTRAINT `raport_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `periode_ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raport` ADD CONSTRAINT `raport_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestasi` ADD CONSTRAINT `prestasi_id_periode_ajar_fkey` FOREIGN KEY (`id_periode_ajar`) REFERENCES `periode_ajar`(`id_periode_ajar`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestasi` ADD CONSTRAINT `prestasi_id_siswa_fkey` FOREIGN KEY (`id_siswa`) REFERENCES `siswa`(`id_siswa`) ON DELETE RESTRICT ON UPDATE CASCADE;
