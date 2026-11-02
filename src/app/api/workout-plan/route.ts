import { NextResponse } from "next/server";
import { parseProfile, readJson } from "@/lib/api";
import { calculateNutrition } from "@/lib/nutrition";
import { generateWorkoutPlan } from "@/lib/workoutPlan";

/** POST /api/workout-plan { profile } – weekly training plan for the user's goal and level. */
export async function POST(request: Request) {
  const parsed = parseProfile(await readJson(request));
  if ("error" in parsed) return parsed.error;

  const { profile } = parsed;
  const plan = generateWorkoutPlan({
    goal: calculateNutrition(profile).goal,
    level: profile.fitnessLevel,
    trainingDays: profile.trainingDays,
    weight: profile.weight,
  });
  return NextResponse.json({ plan });
}
