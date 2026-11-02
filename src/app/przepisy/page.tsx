import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/ui";
import { RecipeBrowser } from "@/components/views/RecipeBrowser";
import { recipes } from "@/lib/data/recipes";

export const metadata: Metadata = {
  title: "Przepisy",
  description: "Zdrowe przepisy z policzonymi kaloriami i makroskładnikami – śniadania, obiady, kolacje i przekąski.",
};

export default function RecipesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Baza przepisów"
        title="Propozycje dań"
        description={`${recipes.length} sprawdzonych przepisów z wyliczoną kalorycznością i makroskładnikami. Filtruj według posiłku, diety i kaloryczności.`}
      />
      <Suspense fallback={<Skeleton className="h-150" />}>
        <RecipeBrowser />
      </Suspense>
    </>
  );
}
