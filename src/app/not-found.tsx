import { Icon } from "@/components/Icon";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl" aria-hidden>
        🥕
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-ink">Nie znaleziono strony</h1>
      <p className="mt-2 text-ink-2">Ta strona nie istnieje albo została przeniesiona.</p>
      <ButtonLink href="/" className="mt-6">
        <Icon name="chevronLeft" size={16} /> Wróć na stronę główną
      </ButtonLink>
    </div>
  );
}
