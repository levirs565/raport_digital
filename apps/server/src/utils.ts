import { $Enums, Prisma } from '@prisma/client';
import z from 'zod';

export namespace PrismaHelper {
  export function isRecordNotFoundError(e: any) {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025'
    );
  }

  export function isUniqueConstraintFailed(e: any) {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2002'
    );
  }
}

export function extractFields<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: Record<string, any>
): z.infer<typeof schema> {
  const shapeKeys = Object.keys(schema.shape);
  const result: any = {};
  for (const key of shapeKeys) {
    if (key in data) {
      result[key] = data[key];
    }
  }
  return result;
}

export function isRaportLocked(
  status: $Enums.Status_Raport | undefined | null
) {
  return !!status && status != 'MENUNGGU_KONFIRMASI';
}

export function isSubset<T>(subset: Set<T>, superset: Set<T>): boolean {
  if (subset.size > superset.size) {
    return false;
  }

  for (const item of subset) {
    if (!superset.has(item)) {
      return false;
    }
  }

  return true;
}

export function setDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  const difference = new Set<T>();

  for (const item of setA) {
    if (!setB.has(item)) {
      difference.add(item);
    }
  }

  return difference;
}
