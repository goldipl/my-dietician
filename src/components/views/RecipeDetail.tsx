"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { fmt } from "@/lib/labels";
import { scaleAmount } from "@/lib/mealPlan";
import type { RecipeWithKcal } from "@/lib/types";
import { MacroBar } from "../charts/MacroBar";
import { Icon } from "../Icon";
import { Card, CardTitle } from "../ui";

const clampPortion = (p: number) => Math.min(4, Math.max(0.5, Math.round(p * 100) / 100));

export function RecipeDetail({ recipe }: { recipe: RecipeWithKcal }) {
  const params = useSearchParams();
  const initial = Number(params.get("porcja"));
  const [portion, setPortion] = useState(Number.isFinite(initial) && initial > 0 ? clampPortion(initial) : 1);

  const scaled = (v: number) => Math.round(v * portion);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[360px_1fr]">
      <div className="grid gap-6 lg:sticky lg:top-24">
        <Card>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Porcje</p>
            <div className="flex items-center gap-1 rounded-xl border border-line p-1">
              <button
                type="button"
                onClick={() => setPortion((p) => clampPortion(p - 0.25))}
                className="grid size-8 place-items-center rounded-lg text-lg font-bold text-ink-2 hover:bg-surface-2"
                aria-label="Zmniejsz porcję"
              >
                −
              </button>
              <span className="w-12 text-center font-bold text-ink tabular">{fmt(portion, portion % 1 ? 2 : 0)}</span>
              <button
                type="button"
                onClick={() => setPortion((p) => clampPortion(p + 0.25))}
                className="grid size-8 place-items-center rounded-lg text-lg font-bold text-ink-2 hover:bg-surface-2"
                aria-label="Zwiększ porcję"
              >
                +
              </button>
            </div>
          </div>
          <p className="mt-5 text-4xl font-extrabold text-ink tabular">
            {fmt(scaled(recipe.kcal))} <span className="text-base font-bold text-muted">kcal</span>
          </p>
          <div className="mt-4">
            <MacroBar protein={scaled(recipe.protein)} carbs={scaled(recipe.carbs)} fat={scaled(recipe.fat)} compact />
          </div>
          <p className="mt-4 border-t border-line pt-3 text-sm text-ink-2">
            Błonnik: <strong className="text-ink">{scaled(recipe.fiber)} g</strong>
          </p>
        </Card>
        <Card>
          <CardTitle icon="cart">Składniki</CardTitle>
          <ul className="divide-y divide-line">
            {recipe.ingredients.map((ing) => (
              <li key={ing.name} className="flex justify-between gap-3 py-2.5 text-sm">
                <span className="text-ink">{ing.name}</span>
                <span className="whitespace-nowrap font-semibold text-ink-2 tabular">
                  {ing.unit === "szczypta"
                    ? "szczypta"
                    : `${fmt(scaleAmount(ing.amount, ing.unit, portion), scaleAmount(ing.amount, ing.unit, portion) % 1 ? 2 : 0)} ${ing.unit}`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card>
        <CardTitle icon="utensils">Przygotowanie</CardTitle>
        <ol className="grid gap-4">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-strong text-sm font-bold text-brand-ink">
                {i + 1}
              </span>
              <p className="pt-1 text-ink">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface-2 p-4 text-sm text-ink-2">
          <Icon name="info" size={18} className="mt-px shrink-0 text-muted" />
          Wartości odżywcze są szacunkowe i zależą od użytych produktów. Sól i przyprawy dodawaj według uznania – staraj
          się nie przekraczać 5 g soli dziennie.
        </div>
      </Card>
    </div>
  );
}
