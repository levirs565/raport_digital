import { SemesterType } from "@raport-digital/client-api-types";

export function getPeriodeTitle(periode: {
  tahunAjar: number;
  semester: SemesterType
}) {
  return `${periode.tahunAjar}/${periode.tahunAjar + 1} ${periode.semester == "GANJIL" ? "Ganjil" : "Genap"}`
}
