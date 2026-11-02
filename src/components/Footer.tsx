import Link from "next/link";
import { Logo, NAV } from "./nav";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-md text-sm text-ink-2">
            Twój personalny dietetyk online: kalkulator BMI, zapotrzebowanie kaloryczne, plan posiłków i treningów
            dopasowany do Twojego celu.
          </p>
          <p className="mt-4 max-w-md text-xs text-muted">
            MyDietician ma charakter edukacyjny i nie zastępuje porady lekarza ani dietetyka klinicznego. Przy chorobach
            przewlekłych, w ciąży lub przy BMI poniżej 17 i powyżej 35 skonsultuj zmiany ze specjalistą.
          </p>
        </div>
        <nav aria-label="Stopka">
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink-2 hover:text-brand-strong">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-muted sm:flex-row sm:px-6">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} MyDietician. Dane zapisywane są wyłącznie w Twojej przeglądarce.
          </p>
          <p className="flex items-center gap-2.5">
            Realizacja:
            <AuthorBadge />
          </p>
        </div>
      </div>
    </footer>
  );
}

/** Author's mgodlewskidev.pl wordmark, recreated in markup so it stays crisp at any size. */
function AuthorBadge() {
  return (
    <a
      href="https://mgodlewskidev.pl"
      target="_blank"
      rel="noopener"
      aria-label="mgodlewskidev.pl – strona autora (otwiera się w nowej karcie)"
      className="group inline-flex items-center gap-1.5 rounded-md bg-linear-to-br from-[#332f4c] to-[#25223a] py-0.5 pl-0.5 pr-2 shadow-sm ring-1 ring-white/10 transition hover:-translate-y-px hover:shadow-md hover:shadow-[#6c4dff]/25"
    >
      <span className="grid size-[18px] place-items-center rounded-[5px] bg-linear-to-b from-[#7d63ff] to-[#5638dc] shadow-[inset_0_1px_0_rgb(255_255_255/0.28),0_1px_4px_rgb(86_56_220/0.45)] ring-1 ring-white/15">
        <svg viewBox="0 0 32 32" className="size-4" aria-hidden="true">
          <path
            d="M5 23V14.5a4 4 0 0 1 8 0V23M13 14.5a4 4 0 0 1 8 0V23"
            fill="none"
            stroke="#fff"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="26.6" cy="23" r="2.7" fill="#c6f25a" />
        </svg>
      </span>
      <span className="whitespace-nowrap font-sans text-[11px] leading-none tracking-[-0.02em]">
        <span className="font-extrabold text-[#efeef7]">mgodlewski</span>
        <span className="font-extrabold text-[#8b6dff]">dev</span>
        <span className="mx-[2px] inline-block size-[3px] rounded-full bg-[#8b6dff]" />
        <span className="font-mono text-[9.5px] font-medium tracking-normal text-[#a09eb3]">pl</span>
      </span>
    </a>
  );
}
