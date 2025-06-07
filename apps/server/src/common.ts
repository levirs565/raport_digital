import z from "zod";

export const periodeAjarIdSchema = z.object({
  periode_ajar_id: z.string(),
});

export const raportType = z.enum(["IDENTITAS", "AKADEMIK", "P5"])
