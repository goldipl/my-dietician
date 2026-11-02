import { recipes } from "./data/recipes";
import { WEEKDAYS } from "./labels";
import type {
  Diet,
  Macros,
  MealPlan,
  MealsPerDay,
  MealType,
  PlannedDay,
  PlannedMeal,
  RecipeWithKcal,
  ShoppingItem,
} from "./types";

/** Share of daily calories assigned to each meal. */
export const MEAL_DISTRIBUTION: Record<MealsPerDay, [MealType, number][]> = {
  3: [
    ["breakfast", 0.3],
    ["lunch", 0.4],
    ["dinner", 0.3],
  ],
  4: [
    ["breakfast", 0.25],
    ["lunch", 0.35],
    ["snack", 0.15],
    ["dinner", 0.25],
  ],
  5: [
    ["breakfast", 0.25],
    ["second_breakfast", 0.1],
    ["lunch", 0.35],
    ["snack", 0.1],
    ["dinner", 0.2],
  ],
};

const MIN_PORTION = 0.5;
const MAX_PORTION = 2.5;

/** Deterministic PRNG so a plan can be reproduced from its seed. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function matchesDiet(recipe: RecipeWithKcal, diet: Diet): boolean {
  switch (diet) {
    case "vegetarian":
      return recipe.vegetarian;
    case "vegan":
      return recipe.vegan;
    case "gluten_free":
      return recipe.glutenFree;
    default:
      return true;
  }
}

export function candidatesFor(type: MealType, diet: Diet): RecipeWithKcal[] {
  return recipes.filter((r) => r.mealTypes.includes(type) && matchesDiet(r, diet));
}

const roundPortion = (p: number) => Math.min(MAX_PORTION, Math.max(MIN_PORTION, Math.round(p * 10) / 10));

export function buildMeal(type: MealType, recipe: RecipeWithKcal, portion: number): PlannedMeal {
  const p = roundPortion(portion);
  return {
    type,
    recipe,
    portion: p,
    kcal: Math.round(recipe.kcal * p),
    protein: Math.round(recipe.protein * p),
    carbs: Math.round(recipe.carbs * p),
    fat: Math.round(recipe.fat * p),
  };
}

function dayTotals(meals: PlannedMeal[]) {
  return meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Rescales portions so the day lands as close as possible to the calorie target. */
function balanceDay(meals: PlannedMeal[], targetCalories: number): PlannedMeal[] {
  let current = meals;
  for (let i = 0; i < 2; i++) {
    const total = dayTotals(current).kcal;
    if (!total || Math.abs(total - targetCalories) / targetCalories < 0.02) break;
    const factor = targetCalories / total;
    current = current.map((m) => buildMeal(m.type, m.recipe, m.portion * factor));
  }
  return current;
}

export function makeDay(dayIndex: number, meals: PlannedMeal[]): PlannedDay {
  return { day: dayIndex, label: WEEKDAYS[dayIndex], meals, totals: dayTotals(meals) };
}

interface PickOptions {
  type: MealType;
  slotCalories: number;
  diet: Diet;
  rand: () => number;
  usedToday: Set<string>;
  recentlyUsed: Set<string>;
  usageCount: Map<string, number>;
  /** desired share of energy from protein (0–1) */
  proteinShare: number;
  exclude?: string;
}

function pickRecipe(opts: PickOptions): RecipeWithKcal {
  let pool = candidatesFor(opts.type, opts.diet).filter((r) => r.id !== opts.exclude);
  if (pool.length === 0) pool = candidatesFor(opts.type, "standard").filter((r) => matchesDiet(r, opts.diet));
  if (pool.length === 0) pool = candidatesFor(opts.type, "standard");

  let best = pool[0];
  let bestScore = Infinity;
  for (const recipe of pool) {
    const portion = opts.slotCalories / recipe.kcal;
    // Prefer recipes that fit the slot with a portion close to 1.
    let score = Math.abs(Math.log(portion)) * 1.2;
    if (portion < MIN_PORTION || portion > MAX_PORTION) score += 3;
    // Favour protein-dense dishes when the recipe falls short of the target share.
    const share = (recipe.protein * 4) / recipe.kcal;
    score += Math.max(0, opts.proteinShare - share) * 8;
    if (opts.usedToday.has(recipe.id)) score += 6;
    if (opts.recentlyUsed.has(recipe.id)) score += 1.6;
    score += (opts.usageCount.get(recipe.id) ?? 0) * 0.5;
    score += opts.rand() * 1.1;
    if (score < bestScore) {
      bestScore = score;
      best = recipe;
    }
  }
  return best;
}

export interface MealPlanInput {
  calories: number;
  macros: Macros;
  diet: Diet;
  mealsPerDay: MealsPerDay;
  seed?: number;
  days?: number;
}

export function generateMealPlan(input: MealPlanInput): MealPlan {
  const seed = input.seed ?? Math.floor(Math.random() * 1_000_000);
  const rand = mulberry32(seed);
  const distribution = MEAL_DISTRIBUTION[input.mealsPerDay];
  const totalDays = input.days ?? 7;
  const proteinShare = (input.macros.protein * 4) / input.calories;

  const usageCount = new Map<string, number>();
  const history: Set<string>[] = [];
  const days: PlannedDay[] = [];

  for (let d = 0; d < totalDays; d++) {
    const usedToday = new Set<string>();
    const recentlyUsed = new Set<string>([...(history[d - 1] ?? []), ...(history[d - 2] ?? [])]);
    const meals: PlannedMeal[] = distribution.map(([type, share]) => {
      const slotCalories = input.calories * share;
      const recipe = pickRecipe({
        type,
        slotCalories,
        diet: input.diet,
        rand,
        usedToday,
        recentlyUsed,
        usageCount,
        proteinShare,
      });
      usedToday.add(recipe.id);
      usageCount.set(recipe.id, (usageCount.get(recipe.id) ?? 0) + 1);
      return buildMeal(type, recipe, slotCalories / recipe.kcal);
    });
    history.push(usedToday);
    days.push(makeDay(d, balanceDay(meals, input.calories)));
  }

  return {
    seed,
    targetCalories: input.calories,
    macros: input.macros,
    days,
    shoppingList: buildShoppingList(days),
  };
}

/** Replaces one meal with a different recipe that fits the same slot. */
export function swapMeal(plan: MealPlan, dayIndex: number, mealIndex: number, diet: Diet, mealsPerDay: MealsPerDay): MealPlan {
  const day = plan.days[dayIndex];
  const meal = day?.meals[mealIndex];
  if (!meal) return plan;

  const share = MEAL_DISTRIBUTION[mealsPerDay].find(([t]) => t === meal.type)?.[1] ?? meal.kcal / plan.targetCalories;
  const slotCalories = plan.targetCalories * share;
  const usageCount = new Map<string, number>();
  for (const d of plan.days) for (const m of d.meals) usageCount.set(m.recipe.id, (usageCount.get(m.recipe.id) ?? 0) + 1);

  const recipe = pickRecipe({
    type: meal.type,
    slotCalories,
    diet,
    rand: Math.random,
    usedToday: new Set(day.meals.map((m) => m.recipe.id)),
    recentlyUsed: new Set(),
    usageCount,
    proteinShare: (plan.macros.protein * 4) / plan.targetCalories,
    exclude: meal.recipe.id,
  });

  const meals = day.meals.map((m, i) => (i === mealIndex ? buildMeal(m.type, recipe, slotCalories / recipe.kcal) : m));
  const days = plan.days.map((d, i) => (i === dayIndex ? makeDay(i, balanceDay(meals, plan.targetCalories)) : d));
  return { ...plan, days, shoppingList: buildShoppingList(days) };
}

function roundAmount(amount: number, unit: ShoppingItem["unit"]): number {
  if (unit === "g" || unit === "ml") {
    if (amount >= 100) return Math.ceil(amount / 10) * 10;
    return Math.max(5, Math.ceil(amount / 5) * 5);
  }
  if (unit === "szt.") return Math.max(0.5, Math.ceil(amount * 2) / 2);
  return Math.max(1, Math.ceil(amount));
}

export function scaleAmount(amount: number, unit: ShoppingItem["unit"], portion: number): number {
  const scaled = amount * portion;
  if (unit === "g" || unit === "ml") return Math.round(scaled / 5) * 5 || Math.round(scaled);
  if (unit === "szt.") return Math.round(scaled * 4) / 4;
  return Math.round(scaled * 2) / 2;
}

export function buildShoppingList(days: PlannedDay[]): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const day of days) {
    for (const meal of day.meals) {
      for (const ing of meal.recipe.ingredients) {
        if (ing.unit === "szczypta") continue;
        const key = `${ing.name}|${ing.unit}`;
        const existing = map.get(key);
        const amount = ing.amount * meal.portion;
        if (existing) existing.amount += amount;
        else map.set(key, { name: ing.name, unit: ing.unit, amount });
      }
    }
  }
  return [...map.values()]
    .map((item) => ({ ...item, amount: roundAmount(item.amount, item.unit) }))
    .sort((a, b) => a.name.localeCompare(b.name, "pl"));
}
