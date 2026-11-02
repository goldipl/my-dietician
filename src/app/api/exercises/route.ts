import { NextResponse } from "next/server";
import { exercises } from "@/lib/data/exercises";

/** GET /api/exercises?category=strength&level=beginner */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");

  const result = exercises.filter((e) => (!category || e.category === category) && (!level || e.level === level));
  return NextResponse.json({ count: result.length, exercises: result });
}
