import { $Enums } from "@prisma/client";
import type { AppRouterType } from "../../../apps/server/dist/app/app.router.d.ts"
import type { UserRole as OUserRole, RaportType as ORaportType } from "../../../apps/server/dist/types.d.ts";

export type Router = AppRouterType;
export type UserType = $Enums.AkunType;
export type SemesterType = $Enums.Semester;
export type NilaiEkstrakurikulerType = $Enums.Nilai_Ekstrakurikuler;
export type NilaiP5Type = $Enums.Nilai_P5_Enum;
export type StatusRaportType = $Enums.Status_Raport;
export type RaportType = ORaportType;
export type UserRole = OUserRole
