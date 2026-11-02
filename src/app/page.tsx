import Link from "next/link";
import { Icon, type IconName } from "@/components/Icon";
import { QuickBmi } from "@/components/QuickBmi";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { RotatingWord } from "@/components/hero/RotatingWord";
import { ButtonLink } from "@/components/ui";
import { exercises } from "@/lib/data/exercises";
import { recipes } from "@/lib/data/recipes";

const FEATURES: { icon: IconName; title: string; text: string; href: string }[] = [
  {
    icon: "calculator",
    title: "Kalkulator BMI i kalorii",
    text: "BMI, zapotrzebowanie spoczynkowe (BMR) i całkowite (TDEE) wzorem Mifflina-St Jeora oraz bezpieczny deficyt lub nadwyżka.",
    href: "/kalkulator",
  },
  {
    icon: "utensils",
    title: "Plan posiłków na 7 dni",
    text: "Jadłospis z porcjami przeliczonymi pod Twoje kalorie. Wymieniaj dania jednym kliknięciem i drukuj listę zakupów.",
    href: "/plan-posilkow",
  },
  {
    icon: "book",
    title: `${recipes.length} przepisów`,
    text: "Śniadania, obiady, kolacje i przekąski – również wegetariańskie, wegańskie i bezglutenowe, z pełnymi makro.",
    href: "/przepisy",
  },
  {
    icon: "dumbbell",
    title: "Plan treningowy",
    text: `Tygodniowy plan z ${exercises.length} ćwiczeń: siła, cardio, HIIT i mobilność – dopasowany do celu i poziomu.`,
    href: "/cwiczenia",
  },
  {
    icon: "trending",
    title: "Dziennik postępów",
    text: "Zapisuj wagę, obserwuj trend na wykresie i sprawdzaj, ile zostało do wymarzonej sylwetki.",
    href: "/postepy",
  },
  {
    icon: "leaf",
    title: "Prywatność",
    text: "Bez rejestracji. Twoje dane zostają w Twojej przeglądarce – nic nie wysyłamy na zewnątrz.",
    href: "/panel",
  },
];

const STEPS = [
  { n: 1, title: "Podaj swoje dane", text: "Płeć, wiek, wzrost, aktualna waga oraz waga, którą chcesz osiągnąć." },
  { n: 2, title: "Otrzymaj plan", text: "Wyliczamy kalorie i makroskładniki, a potem układamy jadłospis i treningi." },
  { n: 3, title: "Śledź postępy", text: "Notuj wagę co tydzień – plan przeliczy się, gdy Twoja waga się zmieni." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative -mt-6 mx-[calc(50%-50vw)] sm:-mt-10">
        <HeroBackground />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-28 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-36 lg:pt-20">
          <div>
            <h1
              className="animate-rise text-[2.75rem] font-extrabold leading-[1.02] text-ink sm:text-6xl lg:text-[4.25rem]"
              style={{ animationDelay: "0.1s" }}
            >
              Osiągnij idealną <RotatingWord words={["wagę", "sylwetkę", "formę", "kondycję"]} />
              <span className="mt-2 block text-[0.55em] font-bold leading-tight text-ink-2">z planem szytym na miarę</span>
            </h1>
            <p className="mt-6 max-w-xl animate-rise text-lg text-ink-2" style={{ animationDelay: "0.2s" }}>
              MyDietician oblicza Twoje BMI i zapotrzebowanie kaloryczne, układa tygodniowy jadłospis z przepisami oraz plan
              ćwiczeń, który prowadzi Cię prosto do wagi docelowej.
            </p>
            <div className="mt-8 flex animate-rise flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
              <ButtonLink href="/kalkulator" className="group px-6 py-3.5 text-base shadow-lg shadow-brand/25">
                Zacznij teraz – za darmo{" "}
                <Icon name="arrowRight" size={18} className="transition group-hover:translate-x-1" />
              </ButtonLink>
              <ButtonLink href="/przepisy" variant="secondary" className="px-6 py-3.5 text-base">
                Zobacz przepisy
              </ButtonLink>
            </div>
          </div>
          <div className="animate-rise" style={{ animationDelay: "0.2s" }}>
            <HeroVisual />
          </div>
        </div>
        <svg
          className="absolute inset-x-0 bottom-0 h-16 w-full sm:h-24"
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 64 C240 16 480 16 720 48 C960 80 1200 88 1440 40 L1440 96 L0 96 Z" fill="var(--bg)" />
        </svg>
      </section>

      <Marquee />

      <section className="grid items-center gap-10 py-16 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-brand-strong">Zacznij od podstaw</p>
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Sprawdź, gdzie jesteś dziś</h2>
          <p className="mt-3 max-w-lg text-ink-2">
            BMI to dopiero początek. Po uzupełnieniu profilu policzymy też Twoje zapotrzebowanie kaloryczne,
            makroskładniki i realny termin osiągnięcia celu.
          </p>
          <ul className="mt-6 grid gap-3">
            {[
              "Klasyfikacja BMI według WHO i zakres prawidłowej wagi",
              "Bezpieczne tempo zmian – bez głodówek i efektu jo-jo",
              "Plan dopasowany do diety: wege, wegańskiej i bezglutenowej",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-ink">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-strong">
                  <Icon name="check" size={14} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <QuickBmi />
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Wszystko, czego potrzebujesz</h2>
        <p className="mt-2 max-w-2xl text-ink-2">Jedno miejsce na dietę, treningi i motywację.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title}>
              <Link
                href={f.href}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 shadow-card transition hover:-translate-y-0.5 hover:border-brand/50"
              >
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                  <Icon name={f.icon} size={22} />
                </span>
                <h3 className="mt-4 font-bold text-ink group-hover:text-brand-strong">{f.title}</h3>
                <p className="mt-2 text-sm text-ink-2">{f.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Jak to działa?</h2>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
              <span className="grid size-10 place-items-center rounded-full bg-brand-strong font-extrabold text-brand-ink">
                {s.n}
              </span>
              <h3 className="mt-4 font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl bg-brand-strong p-8 text-brand-ink sm:p-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Gotowy na zmianę?</h2>
            <p className="mt-2 max-w-xl opacity-90">
              Wypełnienie profilu zajmuje mniej niż minutę. Plan posiłków i treningów dostaniesz od razu.
            </p>
          </div>
          <Link
            href="/kalkulator"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-surface px-5 py-3 font-bold text-ink shadow-sm transition hover:brightness-95"
          >
            Oblicz swoje BMI <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-linear-to-b from-brand-soft via-bg to-bg" />
      <div className="absolute -left-32 top-10 size-[28rem] animate-blob rounded-full bg-brand/25 blur-3xl" />
      <div
        className="absolute -right-24 top-40 size-[26rem] animate-blob rounded-full bg-accent/20 blur-3xl"
        style={{ animationDelay: "-7s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 size-[22rem] animate-blob rounded-full bg-[#84cc16]/20 blur-3xl"
        style={{ animationDelay: "-13s" }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(var(--line) 1.2px, transparent 1.2px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />
    </div>
  );
}

const MARQUEE_ITEMS = [
  "🥑 Zdrowe przepisy",
  "📊 Kalkulator BMI",
  "🔥 Spalanie kalorii",
  "🌱 Dieta wegańska",
  "🌾 Bez glutenu",
  "🏃 Plan treningowy",
  "💧 Nawodnienie",
  "🛒 Lista zakupów",
  "📈 Dziennik wagi",
  "🧘 Mobilność",
];

function Marquee() {
  return (
    <div className="relative mx-[calc(50%-50vw-48px)] -mt-6 -rotate-1 overflow-hidden bg-brand-strong py-3.5 text-brand-ink shadow-lg">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {MARQUEE_ITEMS.map((item) => (
              <li key={item} className="flex items-center whitespace-nowrap px-6 font-display text-lg font-bold">
                {item}
                <span className="ml-12 opacity-50">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
