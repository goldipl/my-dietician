export type Sex = "female" | "male";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type Diet = "standard" | "vegetarian" | "vegan" | "gluten_free";

export type MealsPerDay = 3 | 4 | 5;

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface Profile {
  name?: string;
  sex: Sex;
  age: number;
  /** kg */
  weight: number;
  /** cm */
  height: number;
  /** kg */
  targetWeight: number;
  activity: ActivityLevel;
  /** desired weight change in kg per week (always positive) */
  pace: number;
  diet: Diet;
  mealsPerDay: MealsPerDay;
  fitnessLevel: FitnessLevel;
  trainingDays: number;
}

export type Goal = "lose" | "maintain" | "gain";

export type BmiCategoryKey =
  | "severe_thinness"
  | "moderate_thinness"
  | "underweight"
  | "normal"
  | "overweight"
  | "obesity_1"
  | "obesity_2"
  | "obesity_3";

export interface BmiCategory {
  key: BmiCategoryKey;
  label: string;
  min: number;
  max: number;
  tone: "danger" | "warning" | "success";
  advice: string;
}

export interface BmiResult {
  bmi: number;
  category: BmiCategory;
  healthyRange: { min: number; max: number };
  idealWeight: number;
}

export interface Macros {
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export interface NutritionResult {
  bmi: BmiResult;
  targetBmi: number;
  goal: Goal;
  bmr: number;
  tdee: number;
  calories: number;
  /** kcal per day below (negative) or above (positive) TDEE */
  energyBalance: number;
  effectivePace: number;
  macros: Macros;
  waterLiters: number;
  weeksToGoal: number | null;
  goalDate: string | null;
  warnings: string[];
}

export type MealType = "breakfast" | "second_breakfast" | "lunch" | "snack" | "dinner";

export interface Ingredient {
  name: string;
  amount: number;
  unit: "g" | "ml" | "szt." | "łyżka" | "łyżeczka" | "szczypta";
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  mealTypes: MealType[];
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  prepTime: number;
  difficulty: "łatwy" | "średni";
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  ingredients: Ingredient[];
  steps: string[];
}

export interface RecipeWithKcal extends Recipe {
  kcal: number;
}

export interface PlannedMeal {
  type: MealType;
  recipe: RecipeWithKcal;
  /** portion multiplier applied to the base recipe */
  portion: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PlannedDay {
  day: number;
  label: string;
  meals: PlannedMeal[];
  totals: { kcal: number; protein: number; carbs: number; fat: number };
}

export interface MealPlan {
  seed: number;
  targetCalories: number;
  macros: Macros;
  days: PlannedDay[];
  shoppingList: ShoppingItem[];
}

export interface ShoppingItem {
  name: string;
  amount: number;
  unit: Ingredient["unit"];
}

export type ExerciseCategory = "cardio" | "strength" | "hiit" | "mobility";

export interface Exercise {
  id: string;
  name: string;
  emoji: string;
  category: ExerciseCategory;
  level: FitnessLevel;
  met: number;
  muscles: string[];
  equipment: string;
  description: string;
  steps: string[];
  tips: string;
  /** strength/hiit: reps per set (or seconds when `timed`), cardio/mobility: minutes */
  base: { sets?: number; reps?: number; minutes?: number; timed?: boolean };
}

export interface WorkoutItem {
  exercise: Exercise;
  sets?: number;
  reps?: number;
  seconds?: number;
  minutes?: number;
  durationMin: number;
  kcal: number;
}

export interface WorkoutDay {
  day: number;
  label: string;
  title: string;
  focus: string;
  rest: boolean;
  items: WorkoutItem[];
  durationMin: number;
  kcal: number;
}

export interface WorkoutPlan {
  goal: Goal;
  level: FitnessLevel;
  days: WorkoutDay[];
  weeklyKcal: number;
  weeklyMinutes: number;
  dailySteps: number;
  tips: string[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}
