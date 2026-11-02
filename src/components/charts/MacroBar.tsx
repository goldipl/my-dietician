import { fmt } from "@/lib/labels";

interface MacroBarProps {
  protein: number;
  carbs: number;
  fat: number;
  /** stacked legend for narrow containers */
  compact?: boolean;
  /** daily goals in grams, shown next to the values in compact mode */
  targets?: { protein: number; carbs: number; fat: number };
}

/** Share of energy from protein / carbs / fat as a single stacked bar with a legend. */
export function MacroBar({ protein, carbs, fat, compact, targets }: MacroBarProps) {
  const parts = [
    { key: "protein" as const, label: "Białko", grams: protein, kcal: protein * 4, color: "var(--series-1)" },
    { key: "carbs" as const, label: "Węglowodany", grams: carbs, kcal: carbs * 4, color: "var(--series-2)" },
    { key: "fat" as const, label: "Tłuszcze", grams: fat, kcal: fat * 9, color: "var(--series-3)" },
  ];
  const total = parts.reduce((s, p) => s + p.kcal, 0) || 1;

  return (
    <figure aria-label="Rozkład makroskładników">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {parts.map((p) => (
          <div
            key={p.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(p.kcal / total) * 100}%`, background: p.color }}
            title={`${p.label}: ${p.grams} g (${Math.round((p.kcal / total) * 100)}% energii)`}
          />
        ))}
      </div>
      {compact ? (
        <figcaption className="mt-3 grid gap-1.5">
          {parts.map((p) => (
            <div key={p.key} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
              <span className="flex-1 text-ink-2">{p.label}</span>
              <span className="font-bold text-ink tabular">
                {fmt(p.grams)} g
                {targets && <span className="font-normal text-muted"> / {fmt(targets[p.key])} g</span>}
              </span>
              <span className="w-9 text-right text-xs text-muted tabular">{Math.round((p.kcal / total) * 100)}%</span>
            </div>
          ))}
        </figcaption>
      ) : (
      <figcaption className="mt-3 grid gap-2 sm:grid-cols-3">
        {parts.map((p) => (
          <div key={p.key} className="flex items-start gap-2">
            <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
            <div>
              <p className="text-xs text-muted">{p.label}</p>
              <p className="font-bold text-ink tabular">
                {fmt(p.grams)} g{" "}
                <span className="text-xs font-medium text-muted">{Math.round((p.kcal / total) * 100)}%</span>
              </p>
            </div>
          </div>
        ))}
      </figcaption>
      )}
    </figure>
  );
}
