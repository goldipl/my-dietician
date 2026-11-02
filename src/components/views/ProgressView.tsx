"use client";

import { useState } from "react";
import { fmt, fmtDate } from "@/lib/labels";
import { calculateBmiValue, getBmiCategory } from "@/lib/nutrition";
import { WeightChart } from "../charts/WeightChart";
import { Icon } from "../Icon";
import { useProfile } from "../ProfileProvider";
import { Button, Card, CardTitle, EmptyProfile, Notice, PageHeader, Skeleton, Stat } from "../ui";

const today = () => new Date().toISOString().slice(0, 10);

export function ProgressView() {
  const { hydrated, profile, nutrition, weights, addWeight, removeWeight, saveProfile } = useProfile();
  const [date, setDate] = useState(today);
  const [value, setValue] = useState("");

  if (!hydrated) return <Skeleton className="h-150" />;
  if (!profile || !nutrition) return <EmptyProfile text="Zapisz profil, aby śledzić zmiany wagi i postępy w drodze do celu." />;

  const start = weights[0]?.weight ?? profile.weight;
  const latest = weights[weights.length - 1]?.weight ?? profile.weight;
  const totalChange = profile.targetWeight - start;
  const done = latest - start;
  const progress = totalChange === 0 ? 100 : Math.max(0, Math.min(100, (done / totalChange) * 100));
  const remaining = profile.targetWeight - latest;
  const bmiNow = calculateBmiValue(latest, profile.height);
  const parsed = Number(value.replace(",", "."));
  const valid = parsed >= 35 && parsed <= 300 && !!date && date <= today();

  return (
    <>
      <PageHeader
        eyebrow="Dziennik wagi"
        title="Twoje postępy"
        description="Waż się raz w tygodniu, o tej samej porze – najlepiej rano, na czczo. Pojedyncze wahania są normalne, liczy się trend."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="calendar" label="Waga początkowa" value={fmt(start, 1)} unit="kg" hint={weights[0] ? fmtDate(weights[0].date) : undefined} />
        <Stat
          icon="activity"
          label="Aktualna waga"
          value={fmt(latest, 1)}
          unit="kg"
          hint={`${done > 0 ? "+" : ""}${fmt(done, 1)} kg od startu`}
        />
        <Stat
          icon="target"
          label="Do celu"
          value={Math.abs(remaining) < 0.1 ? "🎉 0" : `${remaining > 0 ? "+" : ""}${fmt(remaining, 1)}`}
          unit="kg"
          hint={`Cel: ${fmt(profile.targetWeight, 1)} kg`}
        />
        <Stat icon="calculator" label="BMI teraz" value={fmt(bmiNow, 1)} hint={getBmiCategory(bmiNow).label} />
      </div>

      <Card className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-ink">Postęp do celu</span>
          <span className="font-bold text-brand-strong tabular">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-brand-strong transition-all" style={{ width: `${progress}%` }} />
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardTitle icon="trending">Zmiana masy ciała</CardTitle>
          {weights.length > 0 ? (
            <>
              <WeightChart entries={weights} target={profile.targetWeight} healthyRange={nutrition.bmi.healthyRange} />
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded" style={{ background: "var(--series-1)" }} /> Twoja waga
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-4 border-t-2 border-dashed border-ink-2" /> Waga docelowa
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-3 rounded-sm" style={{ background: "var(--good)", opacity: 0.25 }} /> Zakres prawidłowej wagi
                </span>
              </p>
              {weights.length < 2 && (
                <p className="mt-4 text-sm text-muted">Dodaj kolejne pomiary, aby zobaczyć trend.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-muted">Brak pomiarów. Dodaj pierwszy wpis obok.</p>
          )}
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardTitle icon="plus">Dodaj pomiar</CardTitle>
            <form
              className="grid gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!valid) return;
                addWeight({ date, weight: Math.round(parsed * 10) / 10 });
                setValue("");
              }}
            >
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-ink">Data</span>
                <input
                  type="date"
                  value={date}
                  max={today()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-ink"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-semibold text-ink">Waga (kg)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => setValue(e.target.value.replace(/[^\d.,]/g, ""))}
                  placeholder={fmt(latest, 1)}
                  className="w-full rounded-xl border border-line bg-surface px-3 py-2.5 font-semibold text-ink tabular"
                />
              </label>
              <Button type="submit" disabled={!valid}>
                <Icon name="plus" size={16} /> Zapisz pomiar
              </Button>
            </form>
            {Math.abs(latest - profile.weight) >= 0.1 && (
              <div className="mt-4">
                <Notice>
                  Twoja ostatnia waga ({fmt(latest, 1)} kg) różni się od wagi w profilu ({fmt(profile.weight, 1)} kg).{" "}
                  <button className="font-semibold text-brand-strong underline" onClick={() => saveProfile({ ...profile, weight: latest })}>
                    Przelicz dietę
                  </button>
                </Notice>
              </div>
            )}
          </Card>

          {weights.length > 0 && (
            <Card>
              <CardTitle icon="calendar">Historia</CardTitle>
              <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {[...weights].reverse().map((w, i, arr) => {
                  const prev = arr[i + 1];
                  const delta = prev ? w.weight - prev.weight : 0;
                  return (
                    <li key={w.date} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                      <span className="text-ink-2">{new Date(w.date + "T12:00:00").toLocaleDateString("pl-PL")}</span>
                      <span className="ml-auto font-bold text-ink tabular">{fmt(w.weight, 1)} kg</span>
                      <span className="w-14 text-right text-xs text-muted tabular">
                        {prev ? `${delta > 0 ? "+" : ""}${fmt(delta, 1)}` : "start"}
                      </span>
                      <button
                        onClick={() => removeWeight(w.date)}
                        className="grid size-7 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-critical"
                        aria-label={`Usuń pomiar z ${w.date}`}
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
