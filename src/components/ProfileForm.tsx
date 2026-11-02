"use client";

import { useMemo, useState } from "react";
import { ACTIVITY_LABELS, DIET_LABELS, LEVEL_LABELS } from "@/lib/labels";
import { determineGoal, MAX_GAIN_PACE } from "@/lib/nutrition";
import { formatZodError, profileSchema } from "@/lib/schema";
import type { ActivityLevel, Diet, FitnessLevel, MealsPerDay, Profile, Sex } from "@/lib/types";
import { Icon } from "./Icon";
import { Button, Card, Segmented, cx } from "./ui";

interface Draft {
  name: string;
  sex: Sex;
  age: string;
  height: string;
  weight: string;
  targetWeight: string;
  activity: ActivityLevel;
  pace: number;
  diet: Diet;
  mealsPerDay: MealsPerDay;
  fitnessLevel: FitnessLevel;
  trainingDays: number;
}

const DEFAULT_DRAFT: Draft = {
  name: "",
  sex: "female",
  age: "30",
  height: "168",
  weight: "72",
  targetWeight: "64",
  activity: "light",
  pace: 0.5,
  diet: "standard",
  mealsPerDay: 4,
  fitnessLevel: "beginner",
  trainingDays: 3,
};

const toDraft = (p: Profile): Draft => ({
  ...p,
  name: p.name ?? "",
  age: String(p.age),
  height: String(p.height),
  weight: String(p.weight),
  targetWeight: String(p.targetWeight),
});

const parseNumber = (v: string) => Number(v.replace(",", "."));

export function useDraftProfile(initial: Profile | null) {
  const [draft, setDraft] = useState<Draft>(() => (initial ? toDraft(initial) : DEFAULT_DRAFT));

  const parsed = useMemo(() => {
    const result = profileSchema.safeParse({
      ...draft,
      name: draft.name || undefined,
      age: parseNumber(draft.age),
      height: parseNumber(draft.height),
      weight: parseNumber(draft.weight),
      targetWeight: parseNumber(draft.targetWeight),
    });
    return result.success
      ? { profile: result.data as Profile, errors: {} as Record<string, string> }
      : { profile: null, errors: formatZodError(result.error) };
  }, [draft]);

  return { draft, setDraft, ...parsed };
}

interface ProfileFormProps {
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  errors: Record<string, string>;
  canSave: boolean;
  onSave: () => void;
  saved: boolean;
}

export function ProfileForm({ draft, setDraft, errors, canSave, onSave, saved }: ProfileFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const weight = parseNumber(draft.weight);
  const target = parseNumber(draft.targetWeight);
  const goal = Number.isFinite(weight) && Number.isFinite(target) ? determineGoal(weight, target) : "maintain";
  const paceOptions = goal === "gain" ? [0.25, 0.5] : [0.25, 0.5, 0.75, 1];

  const numberField = (key: "age" | "height" | "weight" | "targetWeight", label: string, unit: string, hint?: string) => {
    const error = touched[key] ? errors[key] : undefined;
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
        <span
          className={cx(
            "flex items-center rounded-xl border bg-surface transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20",
            error ? "border-critical" : "border-line",
          )}
        >
          <input
            type="text"
            inputMode="decimal"
            value={draft[key]}
            onChange={(e) => set(key, e.target.value.replace(/[^\d.,]/g, ""))}
            onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
            aria-invalid={!!error}
            className="w-full min-w-0 bg-transparent px-3.5 py-2.5 text-base font-semibold text-ink outline-none tabular"
          />
          <span className="pr-3.5 text-sm font-medium text-muted">{unit}</span>
        </span>
        {error ? (
          <span className="mt-1 block text-xs font-medium text-critical">{error}</span>
        ) : (
          hint && <span className="mt-1 block text-xs text-muted">{hint}</span>
        )}
      </label>
    );
  };

  return (
    <Card>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTouched({ age: true, height: true, weight: true, targetWeight: true });
          if (canSave) onSave();
        }}
        className="grid gap-7"
        noValidate
      >
        <fieldset className="grid gap-4">
          <legend className="mb-3 text-lg font-bold text-ink">1. Twoje dane</legend>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-ink">
              Imię <span className="font-normal text-muted">(opcjonalnie)</span>
            </span>
            <input
              type="text"
              value={draft.name}
              maxLength={40}
              onChange={(e) => set("name", e.target.value)}
              placeholder="np. Ania"
              className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </label>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Płeć</span>
            <Segmented
              name="Płeć"
              value={draft.sex}
              onChange={(v) => set("sex", v)}
              options={[
                { value: "female", label: "♀ Kobieta" },
                { value: "male", label: "♂ Mężczyzna" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {numberField("age", "Wiek", "lat")}
            {numberField("height", "Wzrost", "cm")}
            {numberField("weight", "Aktualna waga", "kg")}
            {numberField("targetWeight", "Waga docelowa", "kg", "Waga, którą chcesz osiągnąć")}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-lg font-bold text-ink">2. Aktywność fizyczna</legend>
          <div className="grid gap-2" role="radiogroup" aria-label="Poziom aktywności">
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((key) => {
              const active = draft.activity === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => set("activity", key)}
                  className={cx(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition",
                    active ? "border-brand bg-brand-soft" : "border-line hover:border-brand/50",
                  )}
                >
                  <span>
                    <span className={cx("block text-sm font-semibold", active ? "text-brand-strong" : "text-ink")}>
                      {ACTIVITY_LABELS[key].label}
                    </span>
                    <span className="block text-xs text-muted">{ACTIVITY_LABELS[key].hint}</span>
                  </span>
                  <span
                    className={cx(
                      "grid size-5 shrink-0 place-items-center rounded-full border-2",
                      active ? "border-brand-strong bg-brand-strong text-brand-ink" : "border-line",
                    )}
                  >
                    {active && <Icon name="check" size={12} strokeWidth={3} />}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-3 text-lg font-bold text-ink">3. Dieta</legend>
          {goal !== "maintain" && (
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-ink">
                Tempo {goal === "lose" ? "redukcji" : "przyrostu"} (kg / tydzień)
              </span>
              <Segmented
                name="Tempo zmiany wagi"
                value={Math.min(draft.pace, goal === "gain" ? MAX_GAIN_PACE : 1)}
                onChange={(v) => set("pace", v)}
                options={paceOptions.map((p) => ({
                  value: p,
                  label: p.toString().replace(".", ","),
                  hint: p <= 0.5 ? "Zalecane tempo" : "Szybkie tempo – trudniejsze do utrzymania",
                }))}
              />
              <span className="mt-1 block text-xs text-muted">Zalecane: 0,5 kg/tydz. – bez efektu jo-jo.</span>
            </div>
          )}
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Rodzaj diety</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(DIET_LABELS) as Diet[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={draft.diet === d}
                  onClick={() => set("diet", d)}
                  className={cx(
                    "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
                    draft.diet === d
                      ? "border-brand bg-brand-soft text-brand-strong"
                      : "border-line text-ink-2 hover:border-brand/50",
                  )}
                >
                  {DIET_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Liczba posiłków dziennie</span>
            <Segmented
              name="Liczba posiłków"
              value={draft.mealsPerDay}
              onChange={(v) => set("mealsPerDay", v)}
              options={[
                { value: 3, label: "3 posiłki" },
                { value: 4, label: "4 posiłki" },
                { value: 5, label: "5 posiłków" },
              ]}
            />
          </div>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-3 text-lg font-bold text-ink">4. Treningi</legend>
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-ink">Poziom zaawansowania</span>
            <Segmented
              name="Poziom zaawansowania"
              value={draft.fitnessLevel}
              onChange={(v) => set("fitnessLevel", v)}
              options={(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map((l) => ({
                value: l,
                label: l === "intermediate" ? "Średni" : LEVEL_LABELS[l],
              }))}
            />
          </div>
          <label className="block">
            <span className="mb-1.5 flex justify-between text-sm font-semibold text-ink">
              Dni treningowe w tygodniu
              <span className="text-brand-strong tabular">{draft.trainingDays}</span>
            </span>
            <input
              type="range"
              min={2}
              max={6}
              step={1}
              value={draft.trainingDays}
              onChange={(e) => set("trainingDays", Number(e.target.value))}
              className="w-full"
            />
            <span className="flex justify-between text-xs text-muted tabular">
              {[2, 3, 4, 5, 6].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </label>
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Button type="submit" disabled={!canSave} className="min-w-44">
            <Icon name={saved ? "check" : "leaf"} size={16} />
            {saved ? "Zapisano profil" : "Zapisz i stwórz plan"}
          </Button>
          {!canSave && <span className="text-sm text-critical">{Object.values(errors)[0] ?? "Popraw zaznaczone pola"}</span>}
        </div>
      </form>
    </Card>
  );
}
