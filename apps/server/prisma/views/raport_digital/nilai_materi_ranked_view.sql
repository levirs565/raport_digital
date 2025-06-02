(
  SELECT
    `raport_digital`.`nilai_materi`.`id_materi` AS `id_materi`,
    `raport_digital`.`nilai_materi`.`id_siswa` AS `id_siswa`,
    `raport_digital`.`nilai_materi`.`nilai` AS `nilai`,
    `raport_digital`.`materi`.`id_mata_pelajaran` AS `id_mata_pelajaran`,
    `raport_digital`.`materi`.`id_kelas` AS `id_kelas`,
    `raport_digital`.`materi`.`nama` AS `nama`,
    `raport_digital`.`materi`.`detail` AS `detail`,
    row_number() over (
      PARTITION by `raport_digital`.`nilai_materi`.`id_siswa`,
      `raport_digital`.`materi`.`id_mata_pelajaran`,
      `raport_digital`.`materi`.`id_kelas`
      ORDER BY
        `raport_digital`.`nilai_materi`.`nilai` DESC
    ) AS `rank`
  FROM
    (
      `raport_digital`.`nilai_materi`
      JOIN `raport_digital`.`materi` ON(
        `raport_digital`.`materi`.`id_materi` = `raport_digital`.`nilai_materi`.`id_materi`
      )
    )
  WHERE
    `raport_digital`.`materi`.`nama` <> 'PAS'
)