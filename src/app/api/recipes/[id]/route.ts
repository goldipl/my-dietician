import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api";
import { getRecipe } from "@/lib/data/recipes";

/** GET /api/recipes/:id */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getRecipe(id);
  if (!recipe) return jsonError(404, "Nie znaleziono przepisu");
  return NextResponse.json(recipe);
}
