import type { ActivityLevel, Diet, ExerciseCategory, FitnessLevel, Goal, MealType, Sex } from "./types";

export const SEX_LABELS: Record<Sex, string> = { female: "Kobieta", male: "Mężczyzna" };

export const ACTIVITY_LABELS: Record<ActivityLevel, { label: string; hint: string }> = {
  sedentary: { label: "Siedzący", hint: "Praca biurowa, brak treningów" },
  light: { label: "Lekka aktywność", hint: "Spacery, trening 1–2× w tygodniu" },
  moderate: { label: "Umiarkowana", hint: "Trening 3–4× w tygodniu" },
  active: { label: "Wysoka", hint: "Trening 5–6× w tygodniu" },
  very_active: { label: "Bardzo wysoka", hint: "Praca fizyczna + codzienny trening" },
};

export const DIET_LABELS: Record<Diet, string> = {
  standard: "Standardowa",
  vegetarian: "Wegetariańska",
  vegan: "Wegańska",
  gluten_free: "Bezglutenowa",
};

export const GOAL_LABELS: Record<Goal, string> = {
  lose: "Redukcja masy ciała",
  maintain: "Utrzymanie wagi",
  gain: "Budowa masy",
};

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Śniadanie",
  second_breakfast: "II śniadanie",
  lunch: "Obiad",
  snack: "Podwieczorek",
  dinner: "Kolacja",
};

export const MEAL_TIMES: Record<MealType, string> = {
  breakfast: "7:30",
  second_breakfast: "10:30",
  lunch: "13:30",
  snack: "16:30",
  dinner: "19:00",
};

export const LEVEL_LABELS: Record<FitnessLevel, string> = {
  beginner: "Początkujący",
  intermediate: "Średniozaawansowany",
  advanced: "Zaawansowany",
};

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  cardio: "Cardio",
  strength: "Siłowe",
  hiit: "HIIT",
  mobility: "Mobilność",
};

export const WEEKDAYS = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];
export const WEEKDAYS_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

export const fmt = (value: number, digits = 0) =>
  value.toLocaleString("pl-PL", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Polish plural form: 1 pomiar, 2–4 pomiary, 5+ pomiarów (and 12–14 → "many"). */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
}

export const fmtDate =(iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });
