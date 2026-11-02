"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fmt } from "@/lib/labels";
import type { WeightEntry } from "@/lib/types";

const HEIGHT = 260;
const PAD = { top: 16, right: 16, bottom: 28, left: 40 };

const shortDate = (iso: string) =>
  new Date(iso + "T12:00:00").toLocaleDateString("pl-PL", { day: "numeric", month: "short" });

interface WeightChartProps {
  entries: WeightEntry[];
  target: number;
  healthyRange?: { min: number; max: number };
}

export function WeightChart({ entries, target, healthyRange }: WeightChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    const times = entries.map((e) => new Date(e.date + "T12:00:00").getTime());
    const values = entries.map((e) => e.weight);
    const lo = Math.floor(Math.min(...values, target) - 2);
    const hi = Math.ceil(Math.max(...values, target) + 2);
    const t0 = Math.min(...times);
    const t1 = Math.max(...times);
    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const x = (t: number) => PAD.left + (t1 === t0 ? innerW / 2 : ((t - t0) / (t1 - t0)) * innerW);
    const y = (v: number) => PAD.top + (1 - (v - lo) / (hi - lo)) * innerH;
    const step = Math.max(1, Math.ceil((hi - lo) / 5));
    const yTicks: number[] = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yTicks.push(v);
    const xTickIdx =
      entries.length <= 5
        ? entries.map((_, i) => i)
        : [0, Math.round((entries.length - 1) / 3), Math.round(((entries.length - 1) * 2) / 3), entries.length - 1];
    const points = entries.map((e, i) => ({ ...e, px: x(times[i]), py: y(e.weight) }));
    return { lo, hi, x, y, yTicks, xTickIdx, points, innerW };
  }, [entries, target, width]);

  if (entries.length === 0) return null;

  const { lo, hi, y, yTicks, xTickIdx, points } = geo;
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.px.toFixed(1)},${p.py.toFixed(1)}`).join("");
  const band =
    healthyRange && healthyRange.max > lo && healthyRange.min < hi
      ? { top: y(Math.min(hi, healthyRange.max)), bottom: y(Math.max(lo, healthyRange.min)) }
      : null;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * width;
    let best = 0;
    for (let i = 1; i < points.length; i++) if (Math.abs(points[i].px - mx) < Math.abs(points[best].px - mx)) best = i;
    setHover(best);
  };

  const active = hover !== null ? points[hover] : null;
  const prev = hover ? points[hover - 1] : null;

  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width="100%" height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="img" aria-label="Wykres zmian masy ciała">
        {band && (
          <rect
            x={PAD.left}
            width={width - PAD.left - PAD.right}
            y={band.top}
            height={Math.max(0, band.bottom - band.top)}
            fill="var(--good)"
            opacity={0.08}
          />
        )}
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--grid)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted)" className="tabular">
              {t}
            </text>
          </g>
        ))}
        <line
          x1={PAD.left}
          x2={width - PAD.right}
          y1={y(target)}
          y2={y(target)}
          stroke="var(--ink-2)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={width - PAD.right} y={y(target) - 6} textAnchor="end" fontSize={11} fontWeight={600} fill="var(--ink-2)">
          Cel: {fmt(target, 1)} kg
        </text>
        {xTickIdx.map((i) => (
          <text
            key={i}
            x={points[i].px}
            y={HEIGHT - 8}
            textAnchor={points.length === 1 ? "middle" : i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
            fontSize={11}
            fill="var(--muted)"
          >
            {shortDate(points[i].date)}
          </text>
        ))}
        <path d={path} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {active && (
          <line x1={active.px} x2={active.px} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="var(--axis)" strokeWidth={1} />
        )}
        {points.map((p, i) => (
          <circle
            key={p.date}
            cx={p.px}
            cy={p.py}
            r={i === hover ? 6 : 4}
            fill="var(--series-1)"
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}
        <rect
          x={PAD.left - 10}
          y={0}
          width={width - PAD.left - PAD.right + 20}
          height={HEIGHT}
          fill="transparent"
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
        />
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute z-10 min-w-32 rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-card"
          style={{
            left: Math.min(Math.max(active.px, 70), width - 70),
            top: Math.max(0, active.py - 72),
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-muted">{shortDate(active.date)}</p>
          <p className="text-sm font-bold text-ink tabular">{fmt(active.weight, 1)} kg</p>
          {prev && (
            <p className="text-ink-2 tabular">
              {active.weight - prev.weight > 0 ? "+" : ""}
              {fmt(active.weight - prev.weight, 1)} kg od poprzedniego
            </p>
          )}
        </div>
      )}
    </div>
  );
}
