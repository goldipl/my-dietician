"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DIET_LABELS, fmt, MEAL_LABELS, MEAL_TIMES, WEEKDAYS_SHORT } from "@/lib/labels";
import { swapMeal } from "@/lib/mealPlan";
import type { MealPlan, PlannedMeal } from "@/lib/types";
import { MacroBar } from "../charts/MacroBar";
import { Icon } from "../Icon";
import { useProfile } from "../ProfileProvider";
import { Badge, Button, Card, EmptyProfile, Notice, PageHeader, Skeleton, cx } from "../ui";

export function MealPlanView() {
  const { hydrated, profile, nutrition, mealPlan, setMealPlan } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState(() => (new Date().getDay() + 6) % 7);
  const [tab, setTab] = useState<"menu" | "shopping">("menu");

  const generate = useCallback(
    async (seed?: number) => {
      if (!profile) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/meal-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile, seed }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Błąd serwera");
        const data = (await res.json()) as { plan: MealPlan };
        setMealPlan(data.plan);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nie udało się wygenerować planu");
      } finally {
        setLoading(false);
      }
    },
    [profile, setMealPlan],
  );

  useEffect(() => {
    if (hydrated && profile && !mealPlan && !loading && !error) void generate();
  }, [hydrated, profile, mealPlan, loading, error, generate]);

  if (!hydrated) return <Skeleton className="h-150" />;
  if (!profile || !nutrition) return <EmptyProfile text="Aby przygotować jadłospis, potrzebujemy Twoich danych i celu." />;

  const current = mealPlan?.days[day];

  return (
    <>
      <PageHeader
        eyebrow="Jadłospis na 7 dni"
        title="Twój plan posiłków"
        description={
          <>
            Dieta {DIET_LABELS[profile.diet].toLowerCase()}, {profile.mealsPerDay} {profile.mealsPerDay === 5 ? "posiłków" : "posiłki"} dziennie, cel{" "}
            <strong className="text-ink">{fmt(nutrition.calories)} kcal</strong>. Porcje są przeliczone tak, aby każdy dzień
            trafiał w Twoje zapotrzebowanie.
          </>
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()} disabled={!mealPlan}>
              <Icon name="printer" size={16} /> Drukuj
            </Button>
            <Button onClick={() => generate()} disabled={loading}>
              <Icon name="refresh" size={16} className={loading ? "animate-spin" : undefined} /> Nowy jadłospis
            </Button>
          </>
        }
      />

      {error && (
        <div className="mb-6">
          <Notice tone="warning">
            {error}{" "}
            <button className="font-semibold underline" onClick={() => generate()}>
              Spróbuj ponownie
            </button>
          </Notice>
        </div>
      )}

      {profile.diet === "vegan" && (
        <div className="no-print mb-6">
          <Notice>
            W diecie wegańskiej trudniej o białko – sięgaj po tofu, tempeh, strączki i napoje sojowe. Pamiętaj też o
            suplementacji witaminy B12 (i rozważ D3 oraz omega-3 z alg).
          </Notice>
        </div>
      )}

      {!mealPlan || !current ? (
        <div className="grid gap-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <>
          <div className="no-print mb-6 flex gap-1 rounded-xl border border-line bg-surface p-1 shadow-card sm:w-fit">
            {(["menu", "shopping"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cx(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none",
                  tab === t ? "bg-brand-strong text-brand-ink" : "text-ink-2 hover:bg-surface-2",
                )}
              >
                <Icon name={t === "menu" ? "utensils" : "cart"} size={16} />
                {t === "menu" ? "Jadłospis" : `Lista zakupów (${mealPlan.shoppingList.length})`}
              </button>
            ))}
          </div>

          {tab === "menu" ? (
            <>
              <div className="no-print mb-6 grid grid-cols-7 gap-1.5" role="tablist" aria-label="Dzień tygodnia">
                {mealPlan.days.map((d, i) => (
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
                    <span className={cx("block text-sm font-bold", i === day ? "text-brand-strong" : "text-ink")}>
                      {WEEKDAYS_SHORT[i]}
                    </span>
                    <span className="hidden text-xs text-muted tabular sm:block">{fmt(d.totals.kcal)} kcal</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
                <div className="grid gap-4">
                  <h2 className="text-xl font-bold text-ink">{current.label}</h2>
                  {current.meals.map((meal, i) => (
                    <MealCard
                      key={`${meal.type}-${meal.recipe.id}`}
                      meal={meal}
                      onSwap={() => setMealPlan(swapMeal(mealPlan, day, i, profile.diet, profile.mealsPerDay))}
                    />
                  ))}
                </div>
                <Card className="order-first lg:sticky lg:top-24 lg:order-none">
                  <p className="text-sm font-semibold text-muted">Podsumowanie dnia</p>
                  <p className="mt-1 text-3xl font-extrabold text-ink tabular">
                    {fmt(current.totals.kcal)} <span className="text-base font-bold text-muted">kcal</span>
                  </p>
                  <p className="text-sm text-ink-2 tabular">
                    cel {fmt(mealPlan.targetCalories)} kcal (
                    {current.totals.kcal - mealPlan.targetCalories >= 0 ? "+" : ""}
                    {fmt(current.totals.kcal - mealPlan.targetCalories)})
                  </p>
                  <div className="mt-5">
                    <MacroBar
                      protein={current.totals.protein}
                      carbs={current.totals.carbs}
                      fat={current.totals.fat}
                      targets={mealPlan.macros}
                      compact
                    />
                  </div>
                  <p className="mt-4 flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-sm text-ink-2">
                    <Icon name="droplet" size={16} className="shrink-0" style={{ color: "var(--series-1)" }} />
                    Pij ok. {fmt(nutrition.waterLiters, 1)} l wody dziennie.
                  </p>
                </Card>
              </div>
            </>
          ) : (
            <ShoppingList plan={mealPlan} />
          )}
        </>
      )}
    </>
  );
}

function MealCard({ meal, onSwap }: { meal: PlannedMeal; onSwap: () => void }) {
  const { recipe } = meal;
  return (
    <Card className="p-0 sm:p-0">
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:p-5">
        <div className="grid size-12 shrink-0 place-items-center self-start rounded-2xl bg-surface-2 text-3xl sm:size-16 sm:self-center sm:text-4xl" aria-hidden>
          {recipe.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-strong">
            {MEAL_LABELS[meal.type]} <span className="font-medium text-muted">• {MEAL_TIMES[meal.type]}</span>
          </p>
          <Link
            href={`/przepisy/${recipe.id}?porcja=${meal.portion}`}
            className="mt-0.5 block font-bold text-ink hover:text-brand-strong"
          >
            {recipe.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone="brand">{fmt(meal.kcal)} kcal</Badge>
            <Badge>
              B {meal.protein} g • W {meal.carbs} g • T {meal.fat} g
            </Badge>
            <Badge>
              <Icon name="clock" size={12} /> {recipe.prepTime} min
            </Badge>
            {meal.portion !== 1 && <Badge tone="accent">{fmt(meal.portion, 1)} porcji</Badge>}
          </div>
        </div>
        <div className="no-print col-span-2 flex sm:col-span-1">
          <Button variant="secondary" onClick={onSwap} className="flex-1 px-3 py-2" title="Wymień na inne danie">
            <Icon name="swap" size={15} /> Wymień
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ShoppingList({ plan }: { plan: MealPlan }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const toggle = (name: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-ink-2">
          Produkty na cały tydzień • odhaczono {checked.size} z {plan.shoppingList.length}
        </p>
        {checked.size > 0 && (
          <Button variant="ghost" className="px-3 py-1.5" onClick={() => setChecked(new Set())}>
            Wyczyść
          </Button>
        )}
      </div>
      <ul className="grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
        {plan.shoppingList.map((item) => {
          const key = `${item.name}|${item.unit}`;
          const done = checked.has(key);
          return (
            <li key={key} className="border-b border-line">
              <label className="flex cursor-pointer items-center gap-3 py-2.5">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggle(key)}
                  className="size-4 accent-[var(--brand-strong)]"
                />
                <span className={cx("flex-1 text-sm", done ? "text-muted line-through" : "text-ink")}>{item.name}</span>
                <span className="text-sm font-semibold text-ink-2 tabular">
                  {fmt(item.amount, item.amount % 1 ? 1 : 0)} {item.unit}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
