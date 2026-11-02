"use client";

import { useMemo, useState } from "react";
import { exercises } from "@/lib/data/exercises";
import { CATEGORY_LABELS, fmt, GOAL_LABELS, LEVEL_LABELS, WEEKDAYS_SHORT } from "@/lib/labels";
import type { Exercise, ExerciseCategory, FitnessLevel, WorkoutItem } from "@/lib/types";
import { generateWorkoutPlan } from "@/lib/workoutPlan";
import { Icon } from "../Icon";
import { useProfile } from "../ProfileProvider";
import { Badge, Button, Card, CardTitle, EmptyProfile, Notice, PageHeader, Skeleton, Stat, cx } from "../ui";

export function WorkoutView() {
  const [tab, setTab] = useState<"plan" | "library">("plan");
  return (
    <>
      <PageHeader
        eyebrow="Ruch to zdrowie"
        title="Plan ćwiczeń"
        description="Tygodniowy plan treningowy dopasowany do Twojego celu, poziomu i liczby dni, które możesz poświęcić na trening. Większość ćwiczeń wykonasz w domu."
      />
      <div className="mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1 shadow-card sm:w-fit">
        {(["plan", "library"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none",
              tab === t ? "bg-brand-strong text-brand-ink" : "text-ink-2 hover:bg-surface-2",
            )}
          >
            <Icon name={t === "plan" ? "calendar" : "book"} size={16} />
            {t === "plan" ? "Mój plan" : `Biblioteka ćwiczeń (${exercises.length})`}
          </button>
        ))}
      </div>
      {tab === "plan" ? <MyPlan /> : <ExerciseLibrary />}
    </>
  );
}

function MyPlan() {
  const { hydrated, profile, nutrition } = useProfile();
  const [day, setDay] = useState(() => (new Date().getDay() + 6) % 7);

  // Generated in the browser (same code as POST /api/workout-plan) so the app also works as a static site.
  const plan = useMemo(
    () =>
      profile && nutrition
        ? generateWorkoutPlan({
            goal: nutrition.goal,
            level: profile.fitnessLevel,
            trainingDays: profile.trainingDays,
            weight: profile.weight,
          })
        : null,
    [profile, nutrition],
  );

  if (!hydrated) return <Skeleton className="h-125" />;
  if (!profile || !plan) return <EmptyProfile text="Podaj swoje dane i cel, a ułożymy dla Ciebie tygodniowy plan treningowy." />;

  const current = plan.days[day];
  const sessions = plan.days.filter((d) => !d.rest).length;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="target" label="Cel" value={GOAL_LABELS[plan.goal]} hint={LEVEL_LABELS[plan.level]} />
        <Stat icon="calendar" label="Treningi" value={sessions} unit="/ tydz." hint={`${fmt(plan.weeklyMinutes)} min ruchu`} />
        <Stat icon="flame" label="Spalanie z ćwiczeń" value={fmt(plan.weeklyKcal)} unit="kcal / tydz." hint={`ok. ${fmt((plan.weeklyKcal * 4.3) / 7700, 1)} kg tłuszczu / mies.`} />
        <Stat icon="activity" label="Kroki dziennie" value={fmt(plan.dailySteps)} hint="Codzienna aktywność poza treningiem" />
      </div>

      <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Dzień tygodnia">
        {plan.days.map((d, i) => (
          <button
            key={d.day}
            role="tab"
            aria-selected={i === day}
            onClick={() => setDay(i)}
            className={cx(
              "rounded-xl border px-1 py-2.5 text-center transition",
              i === day ? "border-brand bg-brand-soft" : "border-line bg-surface hover:border-brand/50",
            )}
          >
            <span className={cx("block text-sm font-bold", i === day ? "text-brand-strong" : "text-ink")}>{WEEKDAYS_SHORT[i]}</span>
            <span className="mx-auto mt-1 block w-fit" aria-hidden>
              {d.rest ? "🌿" : "💪"}
            </span>
            <span className="sr-only">{d.rest ? "regeneracja" : "trening"}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-strong">{current.label}</p>
              <h2 className="mt-1 text-xl font-bold text-ink">{current.title}</h2>
              <p className="text-sm text-ink-2">{current.focus}</p>
            </div>
            <div className="flex gap-1.5">
              <Badge>
                <Icon name="clock" size={12} /> {current.durationMin} min
              </Badge>
              <Badge tone="accent">
                <Icon name="flame" size={12} /> ~{fmt(current.kcal)} kcal
              </Badge>
            </div>
          </div>
          {current.rest && (
            <div className="mb-4">
              <Notice>Dzień regeneracji – mięśnie rosną podczas odpoczynku. Wybierz się na spokojny spacer i zadbaj o sen.</Notice>
            </div>
          )}
          <ol className="grid gap-3">
            {current.items.map((item, i) => (
              <WorkoutRow key={`${item.exercise.id}-${i}`} item={item} index={i + 1} />
            ))}
          </ol>
        </Card>
        <Card className="lg:sticky lg:top-24">
          <CardTitle icon="info">Wskazówki</CardTitle>
          <ul className="grid gap-3 text-sm text-ink-2">
            {plan.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-brand-strong" />
                {tip}
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs text-muted">
            Spalanie szacowane jest metodą MET. Jeśli odczuwasz ból, zawroty głowy lub duszność – przerwij trening i
            skonsultuj się z lekarzem.
          </p>
        </Card>
      </div>
    </div>
  );
}

function prescription(item: WorkoutItem) {
  if (item.minutes) return `${item.minutes} min`;
  if (item.seconds) return `${item.sets} × ${item.seconds} s`;
  return `${item.sets} × ${item.reps} powt.`;
}

function WorkoutRow({ item, index }: { item: WorkoutItem; index: number }) {
  return (
    <li>
      <details className="group rounded-xl border border-line open:bg-surface-2">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-sm font-bold text-ink-2 group-open:bg-surface">
            {index}
          </span>
          <span className="text-2xl" aria-hidden>
            {item.exercise.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-ink">{item.exercise.name}</span>
            <span className="block text-xs text-muted">{CATEGORY_LABELS[item.exercise.category]} • {item.exercise.muscles.join(", ")}</span>
          </span>
          <span className="text-right">
            <span className="block text-sm font-bold text-ink tabular">{prescription(item)}</span>
            <span className="block text-xs text-muted tabular">~{item.kcal} kcal</span>
          </span>
        </summary>
        <ExerciseInfo exercise={item.exercise} />
      </details>
    </li>
  );
}

function ExerciseInfo({ exercise }: { exercise: Exercise }) {
  return (
    <div className="border-t border-line px-4 pb-4 pt-3 text-sm">
      <p className="text-ink-2">{exercise.description}</p>
      <ol className="mt-3 grid list-decimal gap-1 pl-5 text-ink">
        {exercise.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <p className="mt-3 flex gap-2 text-ink-2">
        <span aria-hidden>💡</span>
        {exercise.tips}
      </p>
      <p className="mt-2 text-xs text-muted">Sprzęt: {exercise.equipment}</p>
    </div>
  );
}

const CATEGORY_FILTERS: (ExerciseCategory | "all")[] = ["all", "cardio", "strength", "hiit", "mobility"];
const LEVEL_FILTERS: (FitnessLevel | "all")[] = ["all", "beginner", "intermediate", "advanced"];

function ExerciseLibrary() {
  const [category, setCategory] = useState<ExerciseCategory | "all">("all");
  const [level, setLevel] = useState<FitnessLevel | "all">("all");
  const list = useMemo(
    () => exercises.filter((e) => (category === "all" || e.category === category) && (level === "all" || e.level === level)),
    [category, level],
  );

  return (
    <div className="grid gap-6">
      <Card className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((c) => (
            <Button
              key={c}
              variant={category === c ? "primary" : "secondary"}
              className="rounded-full px-3.5 py-1.5"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c === "all" ? "Wszystkie" : CATEGORY_LABELS[c]}
            </Button>
          ))}
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as FitnessLevel | "all")}
          className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink"
          aria-label="Poziom"
        >
          {LEVEL_FILTERS.map((l) => (
            <option key={l} value={l}>
              {l === "all" ? "Każdy poziom" : LEVEL_LABELS[l]}
            </option>
          ))}
        </select>
      </Card>
      <ul className="grid gap-4 md:grid-cols-2">
        {list.map((e) => (
          <li key={e.id}>
            <Card className="h-full">
              <div className="flex items-start gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface-2 text-3xl" aria-hidden>
                  {e.emoji}
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-ink">{e.name}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone="brand">{CATEGORY_LABELS[e.category]}</Badge>
                    <Badge>{LEVEL_LABELS[e.level]}</Badge>
                    <Badge>MET {fmt(e.met, 1)}</Badge>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-2">{e.description}</p>
              <ol className="mt-3 grid list-decimal gap-1 pl-5 text-sm text-ink">
                {e.steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <p className="mt-3 text-sm text-ink-2">
                <span aria-hidden>💡 </span>
                {e.tips}
              </p>
              <p className="mt-2 text-xs text-muted">
                Partie: {e.muscles.join(", ")} • Sprzęt: {e.equipment}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
