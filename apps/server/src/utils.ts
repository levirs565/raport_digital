import { Prisma } from "@prisma/client";

export namespace PrismaHelper {
    export function isRecordNotFoundError(e: any) {
        return e instanceof Prisma.PrismaClientKnownRequestError && e.code == "P2025";
    }
}