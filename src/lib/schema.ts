import { z } from "zod";

export const profileSchema = z
  .object({
    name: z.string().trim().max(40).optional(),
    sex: z.enum(["female", "male"]),
    age: z.coerce.number().int().min(16, "Minimalny wiek to 16 lat").max(100, "Maksymalny wiek to 100 lat"),
    weight: z.coerce.number().min(35, "Waga musi wynosić co najmniej 35 kg").max(300, "Waga nie może przekraczać 300 kg"),
    height: z.coerce.number().min(130, "Wzrost musi wynosić co najmniej 130 cm").max(230, "Wzrost nie może przekraczać 230 cm"),
    targetWeight: z.coerce
      .number()
      .min(35, "Waga docelowa musi wynosić co najmniej 35 kg")
      .max(300, "Waga docelowa nie może przekraczać 300 kg"),
    activity: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
    pace: z.coerce.number().min(0.25).max(1),
    diet: z.enum(["standard", "vegetarian", "vegan", "gluten_free"]),
    mealsPerDay: z.coerce.number().pipe(z.union([z.literal(3), z.literal(4), z.literal(5)])),
    fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
    trainingDays: z.coerce.number().int().min(2).max(6),
  })
  .strip();

export type ProfileInput = z.input<typeof profileSchema>;

export function formatZodError(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
