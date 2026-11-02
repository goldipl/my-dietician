import type {
  ActivityLevel,
  BmiCategory,
  BmiResult,
  Goal,
  Macros,
  NutritionResult,
  Profile,
  Sex,
} from "./types";

/** Energy stored in 1 kg of body fat (kcal). */
const KCAL_PER_KG = 7700;

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** Minimal safe daily intake without medical supervision. */
const MIN_CALORIES: Record<Sex, number> = { female: 1200, male: 1500 };

export const BMI_CATEGORIES: BmiCategory[] = [
  {
    key: "severe_thinness",
    label: "Wygłodzenie",
    min: 0,
    max: 16,
    tone: "danger",
    advice: "Twoja masa ciała jest znacznie poniżej normy. Skonsultuj się pilnie z lekarzem.",
  },
  {
    key: "moderate_thinness",
    label: "Wychudzenie",
    min: 16,
    max: 17,
    tone: "danger",
    advice: "Masa ciała wyraźnie poniżej normy. Zalecana konsultacja z lekarzem lub dietetykiem.",
  },
  {
    key: "underweight",
    label: "Niedowaga",
    min: 17,
    max: 18.5,
    tone: "warning",
    advice: "Warto stopniowo zwiększyć kaloryczność diety i postawić na trening siłowy.",
  },
  {
    key: "normal",
    label: "Waga prawidłowa",
    min: 18.5,
    max: 25,
    tone: "success",
    advice: "Świetnie! Utrzymuj zbilansowaną dietę i regularną aktywność fizyczną.",
  },
  {
    key: "overweight",
    label: "Nadwaga",
    min: 25,
    max: 30,
    tone: "warning",
    advice: "Umiarkowany deficyt kaloryczny i więcej ruchu pomogą wrócić do normy.",
  },
  {
    key: "obesity_1",
    label: "Otyłość I stopnia",
    min: 30,
    max: 35,
    tone: "danger",
    advice: "Redukcja masy ciała znacząco poprawi zdrowie. Rozważ wsparcie specjalisty.",
  },
  {
    key: "obesity_2",
    label: "Otyłość II stopnia",
    min: 35,
    max: 40,
    tone: "danger",
    advice: "Zalecana jest redukcja masy ciała pod opieką lekarza i dietetyka.",
  },
  {
    key: "obesity_3",
    label: "Otyłość III stopnia",
    min: 40,
    max: Infinity,
    tone: "danger",
    advice: "Konieczna jest konsultacja lekarska i plan redukcji pod nadzorem specjalisty.",
  },
];

const round = (value: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
};

export function calculateBmiValue(weight: number, heightCm: number): number {
  const h = heightCm / 100;
  return round(weight / (h * h), 1);
}

export function getBmiCategory(bmi: number): BmiCategory {
  return BMI_CATEGORIES.find((c) => bmi >= c.min && bmi < c.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}

export function weightForBmi(bmi: number, heightCm: number): number {
  const h = heightCm / 100;
  return bmi * h * h;
}

export function calculateBmi(weight: number, heightCm: number): BmiResult {
  const bmi = calculateBmiValue(weight, heightCm);
  return {
    bmi,
    category: getBmiCategory(bmi),
    healthyRange: {
      min: round(weightForBmi(18.5, heightCm), 1),
      max: round(weightForBmi(24.9, heightCm), 1),
    },
    idealWeight: round(weightForBmi(22, heightCm), 1),
  };
}

/** Mifflin–St Jeor equation. */
export function calculateBmr(sex: Sex, weight: number, heightCm: number, age: number): number {
  return round(10 * weight + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161));
}

export function determineGoal(weight: number, targetWeight: number): Goal {
  const diff = targetWeight - weight;
  if (Math.abs(diff) < 1) return "maintain";
  return diff < 0 ? "lose" : "gain";
}

/** Gaining faster than ~0.5 kg/week mostly adds fat, so the pace is capped. */
export const MAX_GAIN_PACE = 0.5;

export function calculateMacros(calories: number, goal: Goal, weight: number, heightCm: number): Macros {
  // For higher body weights protein is based on the weight at BMI 25 to avoid unrealistic targets.
  const referenceWeight = Math.min(weight, weightForBmi(25, heightCm));
  const proteinPerKg = goal === "lose" ? 1.6 : goal === "gain" ? 1.8 : 1.3;
  const protein = round(referenceWeight * proteinPerKg);
  const fatShare = goal === "gain" ? 0.28 : 0.27;
  const fat = round(Math.max((calories * fatShare) / 9, weight * 0.6));
  const carbs = round(Math.max((calories - protein * 4 - fat * 9) / 4, 50));
  const fiber = round(Math.max(25, (calories / 1000) * 14));
  return { protein, fat, carbs, fiber };
}

export function calculateNutrition(profile: Profile, now: Date = new Date()): NutritionResult {
  const { sex, age, weight, height, targetWeight, activity } = profile;
  const warnings: string[] = [];

  const bmi = calculateBmi(weight, height);
  const targetBmi = calculateBmiValue(targetWeight, height);

  // Never plan a weight loss below the healthy BMI range.
  let planningTarget = targetWeight;
  if (targetWeight < weight && targetBmi < 18.5) {
    planningTarget = Math.min(weight, bmi.healthyRange.min);
  }
  const goal = determineGoal(weight, planningTarget);
  if (determineGoal(weight, targetWeight) === "lose" && goal === "maintain") {
    warnings.push(
      "Przy niedowadze lub wadze bliskiej dolnej granicy normy nie przygotowujemy planu redukcji – plan ma na celu utrzymanie wagi.",
    );
  }

  const bmr = calculateBmr(sex, weight, height, age);
  const tdee = round(bmr * ACTIVITY_FACTORS[activity]);

  let pace = goal === "maintain" ? 0 : profile.pace;
  if (goal === "gain" && pace > MAX_GAIN_PACE) {
    pace = MAX_GAIN_PACE;
    warnings.push("Przy budowaniu masy ograniczyliśmy tempo do 0,5 kg/tydz., aby przyrost był głównie mięśniowy.");
  }

  // Do not let a weight-loss deficit exceed ~1% of body weight per week.
  if (goal === "lose" && pace > weight * 0.01) {
    pace = round(weight * 0.01, 2);
    warnings.push(`Tempo redukcji ograniczono do ${pace.toFixed(2).replace(".", ",")} kg/tydz. (ok. 1% masy ciała).`);
  }

  const dailyDelta = (pace * KCAL_PER_KG) / 7;
  let calories = goal === "lose" ? tdee - dailyDelta : goal === "gain" ? tdee + dailyDelta : tdee;

  const minCalories = MIN_CALORIES[sex];
  if (goal === "lose" && calories < minCalories) {
    calories = minCalories;
    warnings.push(
      `Kaloryczność podniesiono do bezpiecznego minimum ${minCalories} kcal. Tempo spadku wagi będzie wolniejsze.`,
    );
  }
  calories = Math.round(calories / 10) * 10;

  const energyBalance = round(calories - tdee);
  const effectivePace = goal === "maintain" ? 0 : round((Math.abs(energyBalance) * 7) / KCAL_PER_KG, 2);

  if (targetBmi < 18.5 && targetWeight < weight) {
    warnings.push(
      `Waga docelowa odpowiada BMI ${targetBmi.toString().replace(".", ",")}, czyli niedowadze. Plan prowadzi najwyżej do ${bmi.healthyRange.min.toString().replace(".", ",")} kg – dolnej granicy normy.`,
    );
  } else if (targetBmi >= 30) {
    warnings.push("Waga docelowa wciąż odpowiada otyłości – rozważ cel bliższy zakresowi prawidłowej masy ciała.");
  }
  if (age < 18) {
    warnings.push("Osoby niepełnoletnie powinny zmieniać dietę wyłącznie pod opieką lekarza lub dietetyka.");
  }
  if (bmi.bmi >= 35 || bmi.bmi < 17) {
    warnings.push("Przy Twoim BMI zalecamy, aby plan był prowadzony pod kontrolą lekarza.");
  }

  let weeksToGoal: number | null = null;
  let goalDate: string | null = null;
  if (goal !== "maintain" && effectivePace > 0) {
    weeksToGoal = Math.ceil(Math.abs(planningTarget - weight) / effectivePace);
    const date = new Date(now);
    date.setDate(date.getDate() + weeksToGoal * 7);
    goalDate = date.toISOString().slice(0, 10);
  }

  const activeBonus = activity === "active" || activity === "very_active" ? 0.5 : 0;
  const waterLiters = round(weight * 0.033 + activeBonus, 1);

  return {
    bmi,
    targetBmi,
    goal,
    bmr,
    tdee,
    calories,
    energyBalance,
    effectivePace,
    macros: calculateMacros(calories, goal, weight, height),
    waterLiters,
    weeksToGoal,
    goalDate,
    warnings,
  };
}
