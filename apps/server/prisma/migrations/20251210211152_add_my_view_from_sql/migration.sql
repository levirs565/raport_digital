CREATE VIEW nilai_materi_ranked_view AS (
  SELECT
    `nilai_materi`.`id_materi` AS `id_materi`,
    `nilai_materi`.`id_siswa` AS `id_siswa`,
    `nilai_materi`.`nilai` AS `nilai`,
    `materi`.`id_mata_pelajaran` AS `id_mata_pelajaran`,
    `materi`.`id_kelas` AS `id_kelas`,
    `materi`.`nama` AS `nama`,
    `materi`.`detail` AS `detail`,
    row_number() over (
      PARTITION by `nilai_materi`.`id_siswa`,
      `materi`.`id_mata_pelajaran`,
      `materi`.`id_kelas`
      ORDER BY
        `nilai_materi`.`nilai` DESC
    ) AS `rank`
  FROM
    (
      `nilai_materi`
      JOIN `materi` ON(
        `materi`.`id_materi` = `nilai_materi`.`id_materi`
      )
    )
  WHERE
    `materi`.`nama` <> 'PAS'
);

CREATE VIEW nilai_materi_view AS SELECT
  `nilai_materi`.`id_materi` AS `id_materi`,
  `nilai_materi`.`id_siswa` AS `id_siswa`,
  `nilai_materi`.`nilai` AS `nilai`,
  `materi`.`id_mata_pelajaran` AS `id_mata_pelajaran`,
  `materi`.`id_kelas` AS `id_kelas`
FROM
  (
    `nilai_materi`
    JOIN `materi` ON(
      `materi`.`id_materi` = `nilai_materi`.`id_materi`
    )
  );
