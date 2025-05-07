import { $Enums } from "@prisma/client"

export type AccountData = {
    username: string,
    type: $Enums.AkunType
}

declare module 'express-session' {
    interface SessionData {
      account?: AccountData
    }
  }