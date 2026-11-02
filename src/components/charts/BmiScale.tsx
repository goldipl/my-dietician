import { fmt } from "@/lib/labels";

const MIN = 15;
const MAX = 40;

const BANDS = [
  { from: MIN, to: 18.5, label: "Niedowaga", color: "var(--warning)" },
  { from: 18.5, to: 25, label: "Norma", color: "var(--good)" },
  { from: 25, to: 30, label: "Nadwaga", color: "var(--warning)" },
  { from: 30, to: 35, label: "Otyłość I", color: "var(--serious)" },
  { from: 35, to: MAX, label: "Otyłość II+", color: "var(--critical)" },
];

const pct = (v: number) => ((Math.min(MAX, Math.max(MIN, v)) - MIN) / (MAX - MIN)) * 100;

/** Horizontal BMI scale with the user's current (and optionally target) BMI marked. */
export function BmiScale({ bmi, target }: { bmi: number; target?: number }) {
  const showTarget = target !== undefined && Math.abs(target - bmi) >= 0.3;
  // Labels are ~70px wide – stack the target label above when the markers are close.
  const stacked = showTarget && Math.abs(pct(target) - pct(bmi)) < 22;
  return (
    <figure className="w-full" aria-label={`Skala BMI. Twoje BMI: ${fmt(bmi, 1)}${target ? `, docelowe: ${fmt(target, 1)}` : ""}`}>
      <div className={stacked ? "relative h-16" : "relative h-10"}>
        <Marker value={bmi} label={`Ty: ${fmt(bmi, 1)}`} primary />
        {showTarget && <Marker value={target} label={`Cel: ${fmt(target, 1)}`} raised={stacked} />}
      </div>
      <div className="flex h-3 gap-0.5">
        {BANDS.map((b) => (
          <div
            key={b.label}
            title={`${b.label}: ${fmt(b.from, 1)}–${b.to === MAX ? "40+" : fmt(b.to, 1)}`}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${pct(b.to) - pct(b.from)}%`, background: b.color }}
          />
        ))}
      </div>
      <div className="relative mt-1.5 h-4 text-[11px] text-muted tabular">
        {[18.5, 25, 30, 35].map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: `${pct(t)}%` }}>
            {fmt(t, t % 1 ? 1 : 0)}
          </span>
        ))}
      </div>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-2">
        {BANDS.map((b) => (
          <span key={b.label} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: b.color }} />
            {b.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function Marker({ value, label, primary, raised }: { value: number; label: string; primary?: boolean; raised?: boolean }) {
  const left = pct(value);
  // Keep the label inside the figure near the edges.
  const align = left < 12 ? "translate-x-0" : left > 88 ? "-translate-x-full" : "-translate-x-1/2";
  return (
    <div className="absolute bottom-0" style={{ left: `${left}%` }}>
      <span
        className={`absolute ${raised ? "bottom-9" : "bottom-3"} whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-bold tabular ${align} ${
          primary ? "bg-ink text-bg" : "border border-dashed border-ink-2 bg-surface text-ink-2"
        }`}
      >
        {label}
      </span>
      <span
        className={`absolute -bottom-1.5 block ${raised ? "h-10" : "h-4"} w-[3px] -translate-x-1/2 rounded-full ring-2 ring-surface ${primary ? "bg-ink" : "bg-ink-2"}`}
      />
    </div>
  );
}
