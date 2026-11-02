import { NextResponse } from "next/server";
import { recipes } from "@/lib/data/recipes";
import { matchesDiet } from "@/lib/mealPlan";
import type { Diet, MealType } from "@/lib/types";

const MEAL_TYPES: MealType[] = ["breakfast", "second_breakfast", "lunch", "snack", "dinner"];
const DIETS: Diet[] = ["standard", "vegetarian", "vegan", "gluten_free"];

/** GET /api/recipes?meal=lunch&diet=vegan&q=kurczak&maxKcal=600 */
export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const meal = searchParams.get("meal") as MealType | null;
  const diet = searchParams.get("diet") as Diet | null;
  const q = searchParams.get("q")?.trim().toLowerCase();
  const maxKcal = Number(searchParams.get("maxKcal"));

  const result = recipes.filter(
    (r) =>
      (!meal || !MEAL_TYPES.includes(meal) || r.mealTypes.includes(meal)) &&
      (!diet || !DIETS.includes(diet) || matchesDiet(r, diet)) &&
      (!q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q))) &&
      (!maxKcal || r.kcal <= maxKcal),
  );

  return NextResponse.json({ count: result.length, recipes: result });
}
