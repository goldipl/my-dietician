import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ");

export function Card({ className, children, ...props }: ComponentProps<"section">) {
  return (
    <section className={cx("min-w-0 rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6", className)} {...props}>
      {children}
    </section>
  );
}

export function CardTitle({ icon, children, action }: { icon?: IconName; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        {icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand-strong">
            <Icon name={icon} size={17} />
          </span>
        )}
        {children}
      </h2>
      {action}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonStyles: Record<ButtonVariant, string> = {
  primary: "bg-brand-strong text-brand-ink hover:brightness-110 shadow-sm",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ variant = "primary", className, ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={cx(buttonBase, buttonStyles[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={cx(buttonBase, buttonStyles[variant], className)} {...props} />;
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-ink-2">{description}</p>}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  unit,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  hint?: ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-card">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
        {icon && <Icon name={icon} size={14} />}
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-ink">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-muted">{unit}</span>}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-2">{hint}</p>}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-surface-2 text-ink-2",
  brand: "bg-brand-soft text-brand-strong",
  accent: "bg-accent-soft text-accent",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", badgeTones[tone])}>
      {children}
    </span>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warning"; children: ReactNode }) {
  return (
    <div
      className={cx(
        "flex gap-3 rounded-xl border p-3.5 text-sm",
        tone === "warning" ? "border-accent/30 bg-accent-soft text-ink" : "border-line bg-surface-2 text-ink-2",
      )}
      role={tone === "warning" ? "alert" : "note"}
    >
      <Icon name={tone === "warning" ? "alert" : "info"} size={18} className={cx("mt-px shrink-0", tone === "warning" ? "text-accent" : "text-muted")} />
      <div>{children}</div>
    </div>
  );
}

export function Segmented<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: T;
  options: { value: T; label: ReactNode; hint?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 5)}, minmax(0, 1fr))` }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            className={cx(
              "rounded-xl border px-2 py-2.5 text-sm font-semibold transition",
              active ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface text-ink-2 hover:border-brand/50",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-surface-2", className)} />;
}

export function EmptyProfile({ title = "Uzupełnij swój profil", text }: { title?: string; text?: string }) {
  return (
    <Card className="mx-auto max-w-xl text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-soft text-brand-strong">
        <Icon name="user" size={26} />
      </div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-ink-2">
        {text ?? "Podaj płeć, wiek, wagę, wzrost i wagę docelową – na tej podstawie przygotujemy dietę i plan ćwiczeń."}
      </p>
      <ButtonLink href="/kalkulator" className="mt-5">
        Przejdź do kalkulatora <Icon name="arrowRight" size={16} />
      </ButtonLink>
    </Card>
  );
}

export { cx };
