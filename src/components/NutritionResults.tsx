import { fmt, fmtDate, GOAL_LABELS } from "@/lib/labels";
import type { NutritionResult, Profile } from "@/lib/types";
import { BmiScale } from "./charts/BmiScale";
import { MacroBar } from "./charts/MacroBar";
import { Icon } from "./Icon";
import { Card, CardTitle, Notice, cx } from "./ui";

const toneText = {
  success: "text-good",
  warning: "text-warning",
  danger: "text-critical",
} as const;

const toneIcon = { success: "check", warning: "alert", danger: "alert" } as const;

export function BmiCard({ nutrition, profile }: { nutrition: NutritionResult; profile: Profile }) {
  const { bmi } = nutrition;
  return (
    <Card>
      <CardTitle icon="calculator">Twoje BMI</CardTitle>
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="text-5xl font-extrabold tracking-tight text-ink">{fmt(bmi.bmi, 1)}</p>
        <p className={cx("mb-1.5 inline-flex items-center gap-1.5 text-base font-bold", toneText[bmi.category.tone])}>
          <Icon name={toneIcon[bmi.category.tone]} size={18} />
          {bmi.category.label}
        </p>
      </div>
      <p className="mt-2 text-sm text-ink-2">{bmi.category.advice}</p>
      <div className="mt-6">
        <BmiScale bmi={bmi.bmi} target={nutrition.targetBmi} />
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-surface-2 p-3">
          <dt className="text-xs text-muted">Prawidłowa waga dla {profile.height} cm</dt>
          <dd className="font-bold text-ink tabular">
            {fmt(bmi.healthyRange.min, 1)} – {fmt(bmi.healthyRange.max, 1)} kg
          </dd>
        </div>
        <div className="rounded-xl bg-surface-2 p-3">
          <dt className="text-xs text-muted">Waga idealna (BMI 22)</dt>
          <dd className="font-bold text-ink tabular">{fmt(bmi.idealWeight, 1)} kg</dd>
        </div>
      </dl>
    </Card>
  );
}

export function EnergyCard({ nutrition, profile }: { nutrition: NutritionResult; profile: Profile }) {
  const diff = profile.targetWeight - profile.weight;
  return (
    <Card>
      <CardTitle icon="flame">Zapotrzebowanie i cel</CardTitle>
      <div className="rounded-2xl bg-brand-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-strong">{GOAL_LABELS[nutrition.goal]}</p>
        <p className="mt-1 text-4xl font-extrabold tracking-tight text-ink">
          {fmt(nutrition.calories)} <span className="text-lg font-bold text-ink-2">kcal / dzień</span>
        </p>
        <p className="mt-1 text-sm text-ink-2">
          {nutrition.goal === "maintain"
            ? "Jesz tyle, ile spalasz – utrzymasz obecną wagę."
            : `${nutrition.energyBalance > 0 ? "Nadwyżka" : "Deficyt"} ${fmt(Math.abs(nutrition.energyBalance))} kcal względem TDEE • tempo ok. ${fmt(nutrition.effectivePace, 2)} kg/tydz.`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="BMR (spoczynkowo)" value={`${fmt(nutrition.bmr)} kcal`} />
        <MiniStat label="TDEE (z aktywnością)" value={`${fmt(nutrition.tdee)} kcal`} />
        <MiniStat label="Woda" value={`${fmt(nutrition.waterLiters, 1)} l / dzień`} />
        <MiniStat
          label="Do celu"
          value={nutrition.goal === "maintain" ? "Cel osiągnięty" : `${diff > 0 ? "+" : ""}${fmt(diff, 1)} kg`}
        />
        <MiniStat label="Czas" value={nutrition.weeksToGoal ? `${nutrition.weeksToGoal} tyg.` : "—"} />
        <MiniStat label="Przewidywana data" value={nutrition.goalDate ? fmtDate(nutrition.goalDate) : "—"} />
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-semibold text-ink">Makroskładniki dziennie</p>
        <MacroBar {...nutrition.macros} />
        <p className="mt-3 text-xs text-muted">Błonnik: min. {nutrition.macros.fiber} g dziennie.</p>
      </div>

      {nutrition.warnings.length > 0 && (
        <div className="mt-5 grid gap-2">
          {nutrition.warnings.map((w) => (
            <Notice key={w} tone="warning">
              {w}
            </Notice>
          ))}
        </div>
      )}
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-ink tabular">{value}</p>
    </div>
  );
}
