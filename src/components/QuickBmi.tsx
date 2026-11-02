"use client";

import { useState } from "react";
import { fmt } from "@/lib/labels";
import { calculateBmi } from "@/lib/nutrition";
import { BmiScale } from "./charts/BmiScale";
import { Icon } from "./Icon";
import { ButtonLink, cx } from "./ui";

const toneText = { success: "text-good", warning: "text-warning", danger: "text-critical" } as const;

export function QuickBmi() {
  const [weight, setWeight] = useState("75");
  const [height, setHeight] = useState("172");
  const w = Number(weight.replace(",", "."));
  const h = Number(height.replace(",", "."));
  const valid = w >= 35 && w <= 300 && h >= 130 && h <= 230;
  const result = valid ? calculateBmi(w, h) : null;

  const field = (label: string, value: string, set: (v: string) => void, unit: string) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-2">{label}</span>
      <span className="flex items-center rounded-xl border border-line bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => set(e.target.value.replace(/[^\d.,]/g, ""))}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-lg font-bold text-ink outline-none tabular"
        />
        <span className="pr-3 text-sm text-muted">{unit}</span>
      </span>
    </label>
  );

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <p className="flex items-center gap-2 text-sm font-bold text-ink">
        <Icon name="calculator" size={18} className="text-brand-strong" /> Szybki kalkulator BMI
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {field("Waga", weight, setWeight, "kg")}
        {field("Wzrost", height, setHeight, "cm")}
      </div>
      <div className="mt-5 min-h-40" aria-live="polite">
        {result ? (
          <>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-ink tabular">{fmt(result.bmi, 1)}</span>
              <span className={cx("font-bold", toneText[result.category.tone])}>{result.category.label}</span>
            </div>
            <div className="mt-2">
              <BmiScale bmi={result.bmi} />
            </div>
            <p className="mt-3 text-sm text-ink-2">
              Prawidłowa waga dla Twojego wzrostu:{" "}
              <strong className="text-ink tabular">
                {fmt(result.healthyRange.min, 1)}–{fmt(result.healthyRange.max, 1)} kg
              </strong>
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Podaj wagę 35–300 kg i wzrost 130–230 cm.</p>
        )}
      </div>
      <ButtonLink href="/kalkulator" className="mt-4 w-full">
        Stwórz pełny plan diety <Icon name="arrowRight" size={16} />
      </ButtonLink>
    </div>
  );
}
