"use client";

import { useMemo } from "react";
import { calculateNutrition } from "@/lib/nutrition";
import type { Profile } from "@/lib/types";
import { Icon } from "../Icon";
import { BmiCard, EnergyCard } from "../NutritionResults";
import { ProfileForm, useDraftProfile } from "../ProfileForm";
import { useProfile } from "../ProfileProvider";
import { ButtonLink, Card, PageHeader, Skeleton } from "../ui";

export function CalculatorView() {
  const { hydrated, profile } = useProfile();
  return (
    <>
      <PageHeader
        eyebrow="Krok 1"
        title="Kalkulator BMI i zapotrzebowania"
        description="Wpisz swoje aktualne dane oraz wagę, którą chcesz osiągnąć. Wyniki aktualizują się na bieżąco, a po zapisaniu przygotujemy dla Ciebie plan posiłków i ćwiczeń."
      />
      {hydrated ? (
        <CalculatorInner initial={profile} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_1fr]">
          <Skeleton className="h-225" />
          <Skeleton className="h-150" />
        </div>
      )}
    </>
  );
}

const sameProfile = (a: Profile | null, b: Profile | null) => !!a && !!b && JSON.stringify(a) === JSON.stringify(b);

function CalculatorInner({ initial }: { initial: Profile | null }) {
  const { profile: saved, saveProfile } = useProfile();
  const { draft, setDraft, profile, errors } = useDraftProfile(initial);
  const nutrition = useMemo(() => (profile ? calculateNutrition(profile) : null), [profile]);
  const isSaved = sameProfile(profile, saved);

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
      <ProfileForm
        draft={draft}
        setDraft={setDraft}
        errors={errors}
        canSave={!!profile}
        saved={isSaved}
        onSave={() => profile && saveProfile(profile)}
      />
      <div className="grid gap-6 lg:sticky lg:top-24">
        {profile && nutrition ? (
          <>
            <BmiCard nutrition={nutrition} profile={profile} />
            <EnergyCard nutrition={nutrition} profile={profile} />
            {isSaved && (
              <Card className="border-brand/40 bg-brand-soft">
                <p className="font-bold text-ink">Profil zapisany! Co dalej?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ButtonLink href="/plan-posilkow">
                    <Icon name="utensils" size={16} /> Plan posiłków
                  </ButtonLink>
                  <ButtonLink href="/cwiczenia" variant="secondary">
                    <Icon name="dumbbell" size={16} /> Plan ćwiczeń
                  </ButtonLink>
                  <ButtonLink href="/panel" variant="ghost">
                    Panel <Icon name="arrowRight" size={16} />
                  </ButtonLink>
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="text-center text-ink-2">
            <Icon name="calculator" size={28} className="mx-auto mb-2 text-muted" />
            Uzupełnij poprawnie formularz, aby zobaczyć wyniki.
          </Card>
        )}
      </div>
    </div>
  );
}
