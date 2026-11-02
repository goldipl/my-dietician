import type { CSSProperties, ReactNode } from "react";
import { Icon } from "../Icon";

/** Decorative hero composition: salad-bowl illustration with floating "app" cards. */
export function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[500px]" aria-hidden="true">
      <div className="absolute inset-[4%] animate-spin-slow rounded-full border-2 border-dashed border-brand/30" />
      <div className="absolute inset-[13%] rounded-full bg-linear-to-br from-brand-soft via-surface to-accent-soft shadow-card" />
      <div className="absolute inset-[13%] rounded-full ring-1 ring-line" />

      <div className="absolute inset-[10%] animate-float">
        <SaladBowl />
      </div>

      <FloatingEmoji className="left-[14%] top-[10%]" delay="-1s">
        🍓
      </FloatingEmoji>
      <FloatingEmoji className="right-[16%] top-[2%]" delay="-3s">
        🥑
      </FloatingEmoji>
      <FloatingEmoji className="bottom-[22%] right-[3%]" delay="-5s">
        🍋
      </FloatingEmoji>
      <FloatingEmoji className="bottom-[2%] left-[34%]" delay="-2s">
        🥕
      </FloatingEmoji>

      <HeroCard className="left-0 top-[16%] sm:-left-[6%]" delay="-2s">
        <div className="flex items-center gap-3">
          <ProgressRing value={0.72} />
          <div>
            <p className="text-[11px] font-medium text-muted">Dzienny cel</p>
            <p className="font-display text-lg font-bold leading-tight text-ink">1460 kcal</p>
            <p className="text-[11px] text-good">zostało 410 kcal</p>
          </div>
        </div>
      </HeroCard>

      <HeroCard className="right-0 top-[30%] sm:-right-[8%]" delay="-4s">
        <p className="text-[11px] font-medium text-muted">Twoje BMI</p>
        <p className="flex items-center gap-1.5 font-display text-lg font-bold leading-tight text-ink">
          22,7
          <span className="inline-flex items-center gap-0.5 rounded-full bg-brand-soft px-1.5 py-0.5 font-sans text-[10px] font-bold text-brand-strong">
            <Icon name="check" size={10} strokeWidth={3} /> Norma
          </span>
        </p>
        <div className="mt-1.5 flex h-1.5 w-32 gap-0.5">
          <span className="w-[14%] rounded-l-full" style={{ background: "var(--warning)" }} />
          <span className="w-[26%]" style={{ background: "var(--good)" }} />
          <span className="w-[20%]" style={{ background: "var(--warning)" }} />
          <span className="w-[20%]" style={{ background: "var(--serious)" }} />
          <span className="w-[20%] rounded-r-full" style={{ background: "var(--critical)" }} />
        </div>
      </HeroCard>

      <HeroCard className="bottom-[12%] left-0 hidden sm:-left-[4%] sm:block" delay="-1s">
        <p className="mb-2 text-[11px] font-medium text-muted">Makroskładniki</p>
        {[
          ["Białko", "113 g", "78%", "var(--series-1)"],
          ["Węglowodany", "153 g", "62%", "var(--series-2)"],
          ["Tłuszcze", "44 g", "45%", "var(--series-3)"],
        ].map(([label, value, width, color]) => (
          <div key={label} className="mb-1.5 last:mb-0">
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-ink-2">{label}</span>
              <span className="font-semibold text-ink">{value}</span>
            </div>
            <div className="mt-0.5 h-1.5 w-36 rounded-full bg-surface-2">
              <div className="h-full rounded-full" style={{ width, background: color }} />
            </div>
          </div>
        ))}
      </HeroCard>

      <HeroCard className="bottom-[4%] right-[2%]" delay="-5s">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-lg">🔥</span>
          <div>
            <p className="text-[11px] font-medium text-muted">Trening dziś</p>
            <p className="font-display font-bold leading-tight text-ink">40 min • 320 kcal</p>
          </div>
        </div>
      </HeroCard>
    </div>
  );
}

function HeroCard({ className, delay, children }: { className: string; delay: string; children: ReactNode }) {
  return (
    <div
      className={`absolute animate-float rounded-2xl border border-line bg-surface/85 p-3 shadow-card backdrop-blur-md ${className}`}
      style={{ animationDelay: delay } as CSSProperties}
    >
      {children}
    </div>
  );
}

function FloatingEmoji({ className, delay, children }: { className: string; delay: string; children: ReactNode }) {
  return (
    <span
      className={`absolute animate-float text-2xl drop-shadow-sm sm:text-3xl ${className}`}
      style={{ animationDelay: delay, animationDuration: "9s" }}
    >
      {children}
    </span>
  );
}

function ProgressRing({ value }: { value: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="5" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="var(--brand-strong)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${c * value} ${c}`}
      />
    </svg>
  );
}

function SaladBowl() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <linearGradient id="bowl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
        <radialGradient id="tomato-fill" cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fb7185" />
          <stop offset="1" stopColor="#dc2626" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="352" rx="118" ry="13" fill="#000" opacity="0.12" />
      <ellipse cx="200" cy="200" rx="140" ry="30" fill="#064e3b" />

      {/* greens */}
      <ellipse cx="200" cy="196" rx="126" ry="24" fill="#15803d" />
      <ellipse cx="120" cy="178" rx="38" ry="15" fill="#22c55e" transform="rotate(-18 120 178)" />
      <ellipse cx="290" cy="176" rx="40" ry="14" fill="#16a34a" transform="rotate(16 290 176)" />
      <ellipse cx="205" cy="168" rx="44" ry="15" fill="#4ade80" transform="rotate(-6 205 168)" />
      <ellipse cx="165" cy="190" rx="34" ry="12" fill="#86efac" transform="rotate(10 165 190)" />

      {/* avocado */}
      <g transform="rotate(-22 140 170)">
        <ellipse cx="140" cy="170" rx="40" ry="27" fill="#3f6212" />
        <ellipse cx="140" cy="170" rx="34" ry="22" fill="#d9f99d" />
        <ellipse cx="140" cy="170" rx="34" ry="22" fill="none" stroke="#a3e635" strokeWidth="5" />
        <circle cx="150" cy="168" r="10" fill="#92400e" />
        <circle cx="147" cy="165" r="3" fill="#b45309" />
      </g>

      {/* egg */}
      <g transform="rotate(12 262 166)">
        <ellipse cx="262" cy="166" rx="30" ry="21" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
        <circle cx="262" cy="166" r="12" fill="#facc15" />
        <circle cx="258" cy="162" r="4" fill="#fde68a" />
      </g>

      {/* tomatoes */}
      {[
        [212, 150, 19],
        [96, 196, 15],
        [228, 196, 15],
      ].map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={r} fill="url(#tomato-fill)" />
          <circle cx={cx} cy={cy} r={r * 0.68} fill="#f87171" />
          <ellipse cx={cx - r * 0.3} cy={cy} rx={r * 0.12} ry={r * 0.22} fill="#fde68a" />
          <ellipse cx={cx + r * 0.3} cy={cy} rx={r * 0.12} ry={r * 0.22} fill="#fde68a" />
          <ellipse cx={cx} cy={cy - r * 0.32} rx={r * 0.22} ry={r * 0.12} fill="#fde68a" />
        </g>
      ))}

      {/* cucumber */}
      {[
        [312, 192],
        [292, 200],
      ].map(([cx, cy]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r="15" fill="#166534" />
          <circle cx={cx} cy={cy} r="12" fill="#d9f99d" />
          <circle cx={cx} cy={cy} r="4" fill="#bef264" />
        </g>
      ))}

      {/* chickpeas & seeds */}
      {[
        [180, 202],
        [192, 196],
        [170, 196],
        [258, 196],
        [270, 202],
        [120, 202],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" fill="#f2c57c" stroke="#d6a45a" strokeWidth="1" />
      ))}
      {[
        [230, 175],
        [240, 182],
        [186, 178],
        [110, 186],
        [300, 178],
      ].map(([cx, cy]) => (
        <ellipse key={`${cx}-${cy}`} cx={cx} cy={cy} rx="2.5" ry="1.5" fill="#fefce8" />
      ))}

      {/* bowl front */}
      <path d="M60 200 A140 30 0 0 0 340 200 A140 140 0 0 1 60 200 Z" fill="url(#bowl-body)" />
      <path d="M60 200 A140 30 0 0 0 340 200" fill="none" stroke="#6ee7b7" strokeWidth="4" />
      <path d="M92 244 A118 118 0 0 0 150 318" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="7" strokeLinecap="round" />

      {/* accent dots */}
      <circle cx="335" cy="115" r="7" fill="#facc15" />
      <circle cx="58" cy="127" r="5" fill="#34d399" />
    </svg>
  );
}
