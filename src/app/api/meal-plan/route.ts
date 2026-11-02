import { NextResponse } from "next/server";
import { parseProfile, readJson } from "@/lib/api";
import { generateMealPlan } from "@/lib/mealPlan";
import { calculateNutrition } from "@/lib/nutrition";

/** POST /api/meal-plan { profile, seed? } – 7-day meal plan matched to the calorie target. */
export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = parseProfile(body);
  if ("error" in parsed) return parsed.error;

  const rawSeed = body && typeof body === "object" && "seed" in body ? Number((body as { seed: unknown }).seed) : NaN;
  const seed = Number.isFinite(rawSeed) ? Math.abs(Math.floor(rawSeed)) : undefined;

  const { profile } = parsed;
  const nutrition = calculateNutrition(profile);
  const plan = generateMealPlan({
    calories: nutrition.calories,
    macros: nutrition.macros,
    diet: profile.diet,
    mealsPerDay: profile.mealsPerDay,
    seed,
  });
  return NextResponse.json({ nutrition, plan });
}
