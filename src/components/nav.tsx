import Link from "next/link";
import { Icon, type IconName } from "./Icon";

export const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/panel", label: "Panel", icon: "dashboard" },
  { href: "/kalkulator", label: "Kalkulator BMI", icon: "calculator" },
  { href: "/plan-posilkow", label: "Plan posiłków", icon: "utensils" },
  { href: "/przepisy", label: "Przepisy", icon: "book" },
  { href: "/cwiczenia", label: "Ćwiczenia", icon: "dumbbell" },
  { href: "/postepy", label: "Postępy", icon: "trending" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-ink">
      <span className="grid size-9 place-items-center rounded-xl bg-brand-strong text-brand-ink shadow-sm">
        <Icon name="leaf" size={19} />
      </span>
      <span className="font-display text-xl">
        My<span className="text-brand-strong">Dietician</span>
      </span>
    </Link>
  );
}
