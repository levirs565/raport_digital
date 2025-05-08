import { $Enums } from "@prisma/client";
import type { AppRouterType } from "../../../apps/server/dist/app/app.router.d.ts"
import type { UserRole as OUserRole } from "../../../apps/server/dist/types.d.ts";

export type Router = AppRouterType;
export type UserType = $Enums.AkunType;
export type UserRole = OUserRole