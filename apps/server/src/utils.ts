import { Prisma } from '@prisma/client';
import z from 'zod';

export namespace PrismaHelper {
  export function isRecordNotFoundError(e: any) {
    return (
      e instanceof Prisma.PrismaClientKnownRequestError && e.code == 'P2025'
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
