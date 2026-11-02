import { NextResponse } from "next/server";
import { exercises } from "@/lib/data/exercises";
import { recipes } from "@/lib/data/recipes";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "MyDietician API",
    version: "1.0.0",
    recipes: recipes.length,
    exercises: exercises.length,
    time: new Date().toISOString(),
  });
}
