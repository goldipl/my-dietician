"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { recipes } from "@/lib/data/recipes";
import { DIET_LABELS, fmt, MEAL_LABELS } from "@/lib/labels";
import { matchesDiet } from "@/lib/mealPlan";
import type { Diet, MealType, RecipeWithKcal } from "@/lib/types";
import { Icon } from "../Icon";
import { Badge, Card, cx } from "../ui";

const MEAL_FILTERS: (MealType | "all")[] = ["all", "breakfast", "second_breakfast", "lunch", "snack", "dinner"];
const DIET_FILTERS: Diet[] = ["standard", "vegetarian", "vegan", "gluten_free"];
type Sort = "name" | "kcal_asc" | "protein_desc" | "time_asc";

const SORTS: Record<Sort, { label: string; fn: (a: RecipeWithKcal, b: RecipeWithKcal) => number }> = {
  name: { label: "Nazwa", fn: (a, b) => a.name.localeCompare(b.name, "pl") },
  kcal_asc: { label: "Najmniej kcal", fn: (a, b) => a.kcal - b.kcal },
  protein_desc: { label: "Najwięcej białka", fn: (a, b) => b.protein - a.protein },
  time_asc: { label: "Najszybsze", fn: (a, b) => a.prepTime - b.prepTime },
};

const MAX_KCAL = Math.ceil(Math.max(...recipes.map((r) => r.kcal)) / 50) * 50;

export function RecipeBrowser() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const meal = (params.get("posilek") as MealType | null) ?? "all";
  const diet = (params.get("dieta") as Diet | null) ?? "standard";
  const [maxKcal, setMaxKcal] = useState(MAX_KCAL);
  const [sort, setSort] = useState<Sort>("name");

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `/przepisy?${qs}` : "/przepisy", { scroll: false });
  };

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes
      .filter(
        (r) =>
          (meal === "all" || r.mealTypes.includes(meal)) &&
          matchesDiet(r, diet) &&
          r.kcal <= maxKcal &&
          (!q || r.name.toLowerCase().includes(q) || r.ingredients.some((i) => i.name.toLowerCase().includes(q))),
      )
      .sort(SORTS[sort].fn);
  }, [query, meal, diet, maxKcal, sort]);

  return (
    <div className="grid gap-6">
      <Card className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
            <Icon name="search" size={18} className="text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj dania lub składnika, np. łosoś, tofu…"
              className="w-full bg-transparent py-2.5 text-ink outline-none placeholder:text-muted"
              aria-label="Szukaj przepisu"
            />
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm font-semibold text-ink"
            aria-label="Sortowanie"
          >
            {(Object.keys(SORTS) as Sort[]).map((s) => (
              <option key={s} value={s}>
                Sortuj: {SORTS[s].label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {MEAL_FILTERS.map((m) => (
            <Chip key={m} active={meal === m} onClick={() => setParam("posilek", m === "all" ? null : m)}>
              {m === "all" ? "Wszystkie" : MEAL_LABELS[m]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {DIET_FILTERS.map((d) => (
              <Chip key={d} active={diet === d} onClick={() => setParam("dieta", d === "standard" ? null : d)} subtle>
                {d === "standard" ? "Każda dieta" : DIET_LABELS[d]}
              </Chip>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm text-ink-2 md:w-80">
            <span className="whitespace-nowrap tabular">Do {fmt(maxKcal)} kcal</span>
            <input
              type="range"
              min={150}
              max={MAX_KCAL}
              step={50}
              value={maxKcal}
              onChange={(e) => setMaxKcal(Number(e.target.value))}
              className="w-full"
              aria-label="Maksymalna kaloryczność"
            />
          </label>
        </div>
      </Card>

      <p className="text-sm text-muted" aria-live="polite">
        Znaleziono: <strong className="text-ink">{list.length}</strong>
      </p>

      {list.length === 0 ? (
        <Card className="text-center text-ink-2">Brak przepisów dla wybranych filtrów.</Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <li key={r.id}>
              <RecipeCard recipe={r} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  subtle,
  onClick,
  children,
}: {
  active: boolean;
  subtle?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
        active
          ? subtle
            ? "border-brand bg-brand-soft text-brand-strong"
            : "border-brand-strong bg-brand-strong text-brand-ink"
          : "border-line text-ink-2 hover:border-brand/50",
      )}
    >
      {children}
    </button>
  );
}

export function RecipeCard({ recipe }: { recipe: RecipeWithKcal }) {
  return (
    <Link
      href={`/przepisy/${recipe.id}`}
      className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand/50"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-14 place-items-center rounded-2xl bg-surface-2 text-3xl" aria-hidden>
          {recipe.emoji}
        </span>
        <span className="text-right">
          <span className="block text-xl font-extrabold text-ink tabular">{fmt(recipe.kcal)}</span>
          <span className="text-xs text-muted">kcal / porcja</span>
        </span>
      </div>
      <h3 className="mt-4 font-bold text-ink group-hover:text-brand-strong">{recipe.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-2">{recipe.description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Badge>
          <Icon name="clock" size={12} /> {recipe.prepTime} min
        </Badge>
        <Badge>B {recipe.protein} g</Badge>
        {recipe.vegan ? <Badge tone="brand">Wegańskie</Badge> : recipe.vegetarian && <Badge tone="brand">Wege</Badge>}
        {recipe.glutenFree && <Badge tone="accent">Bez glutenu</Badge>}
      </div>
    </Link>
  );
}
