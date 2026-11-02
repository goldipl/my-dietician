import { getExercise } from "./data/exercises";
import { WEEKDAYS } from "./labels";
import type { Exercise, FitnessLevel, Goal, WorkoutDay, WorkoutItem, WorkoutPlan } from "./types";

type SessionKind = "fbwA" | "fbwB" | "cardio" | "cardio_long" | "cardio_light" | "hiit" | "mobility";

const SESSION_META: Record<SessionKind, { title: string; focus: string }> = {
  fbwA: { title: "Trening całego ciała A", focus: "Siła • nogi, klatka, plecy" },
  fbwB: { title: "Trening całego ciała B", focus: "Siła • pośladki, barki, core" },
  cardio: { title: "Cardio w strefie tlenowej", focus: "Kondycja • spalanie tłuszczu" },
  cardio_long: { title: "Długie cardio", focus: "Wytrzymałość • spalanie tłuszczu" },
  cardio_light: { title: "Lekkie cardio + mobilność", focus: "Zdrowie serca • regeneracja" },
  hiit: { title: "Obwód HIIT", focus: "Intensywność • metabolizm" },
  mobility: { title: "Mobilność i rozciąganie", focus: "Elastyczność • regeneracja" },
};

const STRENGTH: Record<FitnessLevel, Record<"fbwA" | "fbwB", string[]>> = {
  beginner: {
    fbwA: ["przysiady", "pompki", "superman", "mostek-biodrowy", "deska"],
    fbwB: ["wykroki", "mostek-biodrowy", "pompki", "dead-bug", "superman"],
  },
  intermediate: {
    fbwA: ["przysiady", "pompki", "wioslowanie-hantla", "mostek-biodrowy", "deska"],
    fbwB: ["wykroki", "martwy-ciag-rumunski", "wyciskanie-nad-glowe", "dead-bug", "superman"],
  },
  advanced: {
    fbwA: ["przysiad-bulgarski", "pompki", "wioslowanie-hantla", "martwy-ciag-rumunski", "deska"],
    fbwB: ["przysiady", "wykroki", "wyciskanie-nad-glowe", "wioslowanie-hantla", "dead-bug"],
  },
};

const HIIT: Record<FitnessLevel, string[]> = {
  beginner: ["pajacyki", "przysiady", "mountain-climbers", "mostek-biodrowy"],
  intermediate: ["pajacyki", "przysiad-z-wyskokiem", "mountain-climbers", "pompki"],
  advanced: ["burpees", "przysiad-z-wyskokiem", "mountain-climbers", "skakanka"],
};

const CARDIO: Record<FitnessLevel, string[]> = {
  beginner: ["szybki-marsz", "rower", "orbitrek", "nordic-walking"],
  intermediate: ["bieganie", "rower", "plywanie", "orbitrek"],
  advanced: ["bieganie", "plywanie", "rower", "bieganie"],
};

const SCHEDULES: Record<Goal, Record<number, SessionKind[]>> = {
  lose: {
    2: ["fbwA", "fbwB"],
    3: ["fbwA", "cardio", "fbwB"],
    4: ["fbwA", "cardio", "fbwB", "hiit"],
    5: ["fbwA", "cardio", "fbwB", "hiit", "cardio_long"],
    6: ["fbwA", "cardio", "fbwB", "hiit", "cardio_long", "mobility"],
  },
  maintain: {
    2: ["fbwA", "fbwB"],
    3: ["fbwA", "cardio", "fbwB"],
    4: ["fbwA", "cardio", "fbwB", "mobility"],
    5: ["fbwA", "cardio", "fbwB", "hiit", "mobility"],
    6: ["fbwA", "cardio", "fbwB", "hiit", "fbwA", "mobility"],
  },
  gain: {
    2: ["fbwA", "fbwB"],
    3: ["fbwA", "fbwB", "fbwA"],
    4: ["fbwA", "fbwB", "cardio_light", "fbwA"],
    5: ["fbwA", "fbwB", "cardio_light", "fbwA", "fbwB"],
    6: ["fbwA", "fbwB", "cardio_light", "fbwA", "fbwB", "mobility"],
  },
};

/** Weekday indexes (0 = Monday) on which sessions are placed, spreading rest days evenly. */
const TRAINING_DAYS: Record<number, number[]> = {
  2: [1, 4],
  3: [0, 2, 4],
  4: [0, 1, 3, 5],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
};

const LEVEL_FACTORS: Record<FitnessLevel, { sets: number; reps: number; minutes: number }> = {
  beginner: { sets: 2, reps: 0.8, minutes: 0.75 },
  intermediate: { sets: 3, reps: 1, minutes: 1 },
  advanced: { sets: 4, reps: 1.25, minutes: 1.25 },
};

const kcalFor = (met: number, weight: number, minutes: number) => Math.round((met * weight * minutes) / 60);
const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);

function timedItem(exercise: Exercise, minutes: number, weight: number): WorkoutItem {
  const m = round5(minutes);
  return { exercise, minutes: m, durationMin: m, kcal: kcalFor(exercise.met, weight, m) };
}

function setsItem(exercise: Exercise, sets: number, repFactor: number, restSec: number, weight: number): WorkoutItem {
  // Cardio-type exercises used in circuits (e.g. skakanka) are performed for time.
  const base = exercise.base.reps ?? 45;
  const isTimed = exercise.base.timed || exercise.base.reps === undefined;
  const value = Math.round(base * repFactor);
  const workSec = isTimed ? value : value * 3;
  const durationMin = Math.max(1, Math.round(((workSec + restSec) * sets) / 60));
  return {
    exercise,
    sets,
    ...(isTimed ? { seconds: value } : { reps: value }),
    durationMin,
    kcal: kcalFor(exercise.met, weight, durationMin),
  };
}

function buildSession(
  kind: SessionKind,
  level: FitnessLevel,
  goal: Goal,
  weight: number,
  variant: number,
): WorkoutItem[] {
  const f = LEVEL_FACTORS[level];
  const warmup = timedItem(getExercise("rozgrzewka-dynamiczna"), 8, weight);
  const cooldown = timedItem(getExercise("stretching"), level === "beginner" ? 5 : 8, weight);
  const cardioId = CARDIO[level][variant % CARDIO[level].length];

  switch (kind) {
    case "fbwA":
    case "fbwB": {
      const sets = goal === "gain" ? Math.min(f.sets + 1, 5) : f.sets;
      const repFactor = goal === "gain" ? f.reps * 0.85 : f.reps;
      const rest = goal === "gain" ? 90 : 60;
      const main = STRENGTH[level][kind].map((id) => setsItem(getExercise(id), sets, repFactor, rest, weight));
      const finisher = goal === "lose" ? [timedItem(getExercise(cardioId), 15 * f.minutes, weight)] : [];
      return [warmup, ...main, ...finisher, cooldown];
    }
    case "cardio":
      return [warmup, timedItem(getExercise(cardioId), 35 * f.minutes, weight), cooldown];
    case "cardio_long":
      return [warmup, timedItem(getExercise(CARDIO[level][(variant + 1) % 4]), 55 * f.minutes, weight), cooldown];
    case "cardio_light":
      return [timedItem(getExercise(CARDIO.beginner[variant % 4]), 30, weight), timedItem(getExercise("joga"), 20, weight)];
    case "hiit": {
      const rounds = level === "beginner" ? 3 : level === "intermediate" ? 4 : 5;
      const circuit = HIIT[level].map((id) => setsItem(getExercise(id), rounds, 1, 30, weight));
      return [warmup, ...circuit, cooldown];
    }
    case "mobility":
      return [timedItem(getExercise(level === "beginner" ? "joga" : "pilates"), 30, weight), cooldown];
  }
}

const GOAL_TIPS: Record<Goal, string[]> = {
  lose: [
    "Łącz trening siłowy z cardio – mięśnie podnoszą codzienne zużycie energii.",
    "Dbaj o kroki: codzienny ruch (NEAT) spala często więcej niż sam trening.",
    "Co 2 tygodnie zwiększ nieznacznie liczbę powtórzeń lub czas cardio.",
    "Śpij 7–9 godzin – niedobór snu zwiększa apetyt i utrudnia redukcję.",
  ],
  maintain: [
    "Utrzymuj regularność – 3–4 treningi tygodniowo w zupełności wystarczą.",
    "Zmieniaj formy aktywności, aby zachować motywację.",
    "Raz w tygodniu postaw na mobilność i regenerację.",
  ],
  gain: [
    "Kluczowa jest progresja: co tydzień dodawaj powtórzenie lub ciężar.",
    "Między seriami odpoczywaj 90–120 sekund.",
    "Spożywaj posiłek białkowy w ciągu 2 godzin po treningu.",
    "Nie przesadzaj z cardio – 1–2 lekkie sesje tygodniowo w zupełności wystarczą.",
  ],
};

export interface WorkoutPlanInput {
  goal: Goal;
  level: FitnessLevel;
  trainingDays: number;
  weight: number;
}

export function generateWorkoutPlan({ goal, level, trainingDays, weight }: WorkoutPlanInput): WorkoutPlan {
  const daysCount = Math.min(6, Math.max(2, Math.round(trainingDays)));
  const schedule = SCHEDULES[goal][daysCount];
  const positions = TRAINING_DAYS[daysCount];

  const days: WorkoutDay[] = WEEKDAYS.map((label, dayIndex) => {
    const slot = positions.indexOf(dayIndex);
    if (slot === -1) {
      const walk = timedItem(getExercise("szybki-marsz"), goal === "lose" ? 30 : 20, weight);
      return {
        day: dayIndex,
        label,
        title: "Aktywna regeneracja",
        focus: "Spacer i odpoczynek",
        rest: true,
        items: [walk],
        durationMin: walk.durationMin,
        kcal: walk.kcal,
      };
    }
    const kind = schedule[slot];
    const items = buildSession(kind, level, goal, weight, slot);
    return {
      day: dayIndex,
      label,
      ...SESSION_META[kind],
      rest: false,
      items,
      durationMin: items.reduce((s, i) => s + i.durationMin, 0),
      kcal: items.reduce((s, i) => s + i.kcal, 0),
    };
  });

  return {
    goal,
    level,
    days,
    weeklyKcal: days.reduce((s, d) => s + d.kcal, 0),
    weeklyMinutes: days.reduce((s, d) => s + d.durationMin, 0),
    dailySteps: goal === "lose" ? 10000 : goal === "maintain" ? 8000 : 7000,
    tips: GOAL_TIPS[goal],
  };
}
