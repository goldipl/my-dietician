"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DIET_LABELS, fmt, fmtDate, GOAL_LABELS, MEAL_LABELS, MEAL_TIMES, plural } from "@/lib/labels";
import { generateWorkoutPlan } from "@/lib/workoutPlan";
import { BmiScale } from "../charts/BmiScale";
import { MacroBar } from "../charts/MacroBar";
import { Icon } from "../Icon";
import { useProfile } from "../ProfileProvider";
import { Button, ButtonLink, Card, CardTitle, EmptyProfile, Notice, PageHeader, Skeleton, Stat } from "../ui";

export function DashboardView() {
  const { hydrated, profile, nutrition, mealPlan, weights, resetAll } = useProfile();
  const todayIndex = (new Date().getDay() + 6) % 7;

  const workout = useMemo(
    () =>
      profile && nutrition
        ? generateWorkoutPlan({
            goal: nutrition.goal,
            level: profile.fitnessLevel,
            trainingDays: profile.trainingDays,
            weight: profile.weight,
          }).days[todayIndex]
        : null,
    [profile, nutrition, todayIndex],
  );

  if (!hydrated) return <Skeleton className="h-150" />;
  if (!profile || !nutrition) return <EmptyProfile title="Witaj w MyDietician!" />;

  const todayMeals = mealPlan?.days[todayIndex];
  const latest = weights[weights.length - 1]?.weight ?? profile.weight;
  const greeting = new Date().getHours() < 12 ? "Dzień dobry" : new Date().getHours() < 18 ? "Cześć" : "Dobry wieczór";

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" })}
        title={`${greeting}${profile.name ? `, ${profile.name}` : ""}!`}
        description={
          <>
            {GOAL_LABELS[nutrition.goal]}: {fmt(latest, 1)} kg → {fmt(profile.targetWeight, 1)} kg
            {nutrition.goalDate && <> • szacowany termin: {fmtDate(nutrition.goalDate)}</>}
          </>
        }
        actions={
          <ButtonLink href="/kalkulator" variant="secondary">
            <Icon name="user" size={16} /> Edytuj profil
          </ButtonLink>
        }
      />

      {nutrition.warnings.length > 0 && (
        <div className="mb-6">
          <Notice tone="warning">{nutrition.warnings[0]}</Notice>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="flame" label="Dzienny cel" value={fmt(nutrition.calories)} unit="kcal" hint={`TDEE ${fmt(nutrition.tdee)} kcal`} />
        <Stat icon="calculator" label="BMI" value={fmt(nutrition.bmi.bmi, 1)} hint={nutrition.bmi.category.label} />
        <Stat
          icon="target"
          label="Do celu"
          value={`${profile.targetWeight - latest > 0 ? "+" : ""}${fmt(profile.targetWeight - latest, 1)}`}
          unit="kg"
          hint={nutrition.weeksToGoal ? `ok. ${nutrition.weeksToGoal} tygodni` : "Utrzymuj formę"}
        />
        <Stat icon="droplet" label="Woda" value={fmt(nutrition.waterLiters, 1)} unit="l / dzień" hint="ok. 8–10 szklanek" />
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardTitle
            icon="utensils"
            action={
              <Link href="/plan-posilkow" className="text-sm font-semibold text-brand-strong hover:underline">
                Cały tydzień →
              </Link>
            }
          >
            Dzisiejsze posiłki
          </CardTitle>
          {todayMeals ? (
            <ul className="divide-y divide-line">
              {todayMeals.meals.map((m) => (
                <li key={m.type}>
                  <Link
                    href={`/przepisy/${m.recipe.id}?porcja=${m.portion}`}
                    className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-surface-2"
                  >
                    <span className="text-2xl" aria-hidden>
                      {m.recipe.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-muted">
                        {MEAL_LABELS[m.type]} • {MEAL_TIMES[m.type]}
                      </span>
                      <span className="block truncate font-semibold text-ink">{m.recipe.name}</span>
                    </span>
                    <span className="text-sm font-bold text-ink-2 tabular">{fmt(m.kcal)} kcal</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl bg-surface-2 p-5 text-center">
              <p className="text-ink-2">
                Nie masz jeszcze jadłospisu ({DIET_LABELS[profile.diet].toLowerCase()}, {fmt(nutrition.calories)} kcal).
              </p>
              <ButtonLink href="/plan-posilkow" className="mt-3">
                Wygeneruj plan posiłków
              </ButtonLink>
            </div>
          )}
          <div className="mt-5 border-t border-line pt-5">
            <p className="mb-3 text-sm font-semibold text-ink">Dzienne makroskładniki</p>
            <MacroBar {...nutrition.macros} />
          </div>
        </Card>

        <div className="grid gap-6">
          {workout && (
            <Card>
              <CardTitle
                icon="dumbbell"
                action={
                  <Link href="/cwiczenia" className="text-sm font-semibold text-brand-strong hover:underline">
                    Plan →
                  </Link>
                }
              >
                Dzisiejszy trening
              </CardTitle>
              <p className="font-bold text-ink">{workout.title}</p>
              <p className="text-sm text-ink-2">{workout.focus}</p>
              <p className="mt-3 flex gap-4 text-sm text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="clock" size={15} /> {workout.durationMin} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="flame" size={15} /> ~{fmt(workout.kcal)} kcal
                </span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {workout.items.map((it, i) => (
                  <li key={i} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-2">
                    {it.exercise.emoji} {it.exercise.name}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <CardTitle icon="calculator">BMI: aktualne i docelowe</CardTitle>
            <BmiScale bmi={nutrition.bmi.bmi} target={nutrition.targetBmi} />
          </Card>
          <Card>
            <CardTitle icon="trending">Postępy</CardTitle>
            <p className="text-sm text-ink-2">
              {weights.length} {plural(weights.length, "pomiar", "pomiary", "pomiarów")} w dzienniku.
            </p>
            <ButtonLink href="/postepy" variant="secondary" className="mt-3 w-full">
              <Icon name="plus" size={16} /> Dodaj dzisiejszą wagę
            </ButtonLink>
          </Card>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => {
            if (confirm("Usunąć profil, jadłospis i historię wagi z tej przeglądarki?")) resetAll();
          }}
        >
          <Icon name="trash" size={14} /> Wyczyść wszystkie dane
        </Button>
      </div>
    </>
  );
}
