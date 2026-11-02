import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Icon } from "@/components/Icon";
import { Badge } from "@/components/ui";
import { RecipeCard } from "@/components/views/RecipeBrowser";
import { RecipeDetail } from "@/components/views/RecipeDetail";
import { getRecipe, recipes } from "@/lib/data/recipes";
import { MEAL_LABELS } from "@/lib/labels";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return recipes.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const recipe = getRecipe((await params).id);
  if (!recipe) return { title: "Nie znaleziono przepisu" };
  return { title: recipe.name, description: `${recipe.description} ${recipe.kcal} kcal na porcję.` };
}

export default async function RecipePage({ params }: Props) {
  const recipe = getRecipe((await params).id);
  if (!recipe) notFound();

  const related = recipes
    .filter((r) => r.id !== recipe.id && r.mealTypes.some((t) => recipe.mealTypes.includes(t)))
    .sort((a, b) => Math.abs(a.kcal - recipe.kcal) - Math.abs(b.kcal - recipe.kcal))
    .slice(0, 3);

  return (
    <article>
      <Link
        href="/przepisy"
        className="no-print mb-6 inline-flex items-center gap-1 text-sm font-semibold text-ink-2 hover:text-brand-strong"
      >
        <Icon name="chevronLeft" size={16} /> Wszystkie przepisy
      </Link>

      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-brand-soft text-6xl" aria-hidden>
          {recipe.emoji}
        </div>
        <div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {recipe.mealTypes.map((t) => (
              <Badge key={t} tone="brand">
                {MEAL_LABELS[t]}
              </Badge>
            ))}
            {recipe.vegan ? <Badge>Wegańskie</Badge> : recipe.vegetarian && <Badge>Wegetariańskie</Badge>}
            {recipe.glutenFree && <Badge tone="accent">Bez glutenu</Badge>}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{recipe.name}</h1>
          <p className="mt-2 max-w-2xl text-ink-2">{recipe.description}</p>
          <p className="mt-3 flex flex-wrap gap-4 text-sm text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="clock" size={16} /> {recipe.prepTime} min
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="activity" size={16} /> Poziom: {recipe.difficulty}
            </span>
          </p>
        </div>
      </header>

      <Suspense>
        <RecipeDetail recipe={recipe} />
      </Suspense>

      {related.length > 0 && (
        <section className="no-print mt-12">
          <h2 className="mb-4 text-xl font-bold text-ink">Podobne dania</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <RecipeCard recipe={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
