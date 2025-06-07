import { $Enums } from '@prisma/client';

export type AccountData = {
  username: string;
  type: $Enums.AkunType;
  namaLengkap?: string;
};

declare module 'express-session' {
  interface SessionData {
    account?: AccountData;
  }
}

export type UserRole = $Enums.AkunType | 'NOT-LOGGED' | 'LOGGED' | null;

export interface Meta {
  allowedRole: UserRole | $Enums.AkunType[];
}

export type RaportType = 'IDENTITAS' | 'AKADEMIK' | 'P5';
