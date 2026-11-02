import { NextResponse } from "next/server";
import { parseProfile, readJson } from "@/lib/api";
import { calculateNutrition } from "@/lib/nutrition";

/** POST /api/nutrition { profile } – BMI, BMR, TDEE, calorie target and macros. */
export async function POST(request: Request) {
  const parsed = parseProfile(await readJson(request));
  if ("error" in parsed) return parsed.error;
  return NextResponse.json(calculateNutrition(parsed.profile));
}
