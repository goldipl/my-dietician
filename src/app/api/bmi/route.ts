import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, readJson } from "@/lib/api";
import { calculateBmi } from "@/lib/nutrition";
import { formatZodError } from "@/lib/schema";

const bmiSchema = z.object({
  weight: z.coerce.number().min(35).max(300),
  height: z.coerce.number().min(130).max(230),
});

function respond(input: unknown) {
  const result = bmiSchema.safeParse(input);
  if (!result.success) return jsonError(422, "Podaj wagę (35–300 kg) i wzrost (130–230 cm)", formatZodError(result.error));
  return NextResponse.json(calculateBmi(result.data.weight, result.data.height));
}

/** GET /api/bmi?weight=80&height=180 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return respond({ weight: searchParams.get("weight"), height: searchParams.get("height") });
}

/** POST /api/bmi { weight, height } */
export async function POST(request: Request) {
  return respond(await readJson(request));
}
