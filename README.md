# MyDietician 🥗

**Twój personalny dietetyk online** – aplikacja webowa w Next.js, która na podstawie płci, wieku, wagi, wzrostu i wagi docelowej:

- oblicza **BMI** (klasyfikacja WHO), prawidłowy zakres wagi i wagę idealną,
- wylicza **zapotrzebowanie kaloryczne** (BMR wzorem Mifflina-St Jeora, TDEE) oraz bezpieczny deficyt/nadwyżkę,
- dobiera **makroskładniki**, błonnik i ilość wody,
- układa **7-dniowy plan posiłków** z porcjami przeliczonymi pod Twoje kalorie (z listą zakupów i wymianą dań),
- udostępnia **bazę 45 przepisów** z kalorycznością i makro,
- przygotowuje **tygodniowy plan ćwiczeń** (26 ćwiczeń: siła, cardio, HIIT, mobilność) pod cel i poziom,
- prowadzi **dziennik wagi** z wykresem postępów.

## Technologie

| Warstwa | Technologia |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Język | TypeScript (strict) |
| Style | Tailwind CSS 4 (tokeny kolorów w CSS, tryb jasny i ciemny) |
| Walidacja | Zod 4 (wspólny schemat dla formularza i API) |
| Dane użytkownika | `localStorage` – bez rejestracji, nic nie opuszcza przeglądarki |

## Uruchomienie

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build produkcyjny
npm start          # serwer produkcyjny
npm run typecheck  # kontrola typów
```

## Struktura

```
src/
├── app/
│   ├── page.tsx              # strona główna + szybki kalkulator BMI
│   ├── kalkulator/           # formularz profilu + wyniki na żywo
│   ├── panel/                # dashboard dnia
│   ├── plan-posilkow/        # jadłospis 7 dni, lista zakupów, druk
│   ├── przepisy/[id]/        # baza przepisów (SSG) + skalowanie porcji
│   ├── cwiczenia/            # plan treningowy + biblioteka ćwiczeń
│   ├── postepy/              # dziennik wagi z wykresem
│   └── api/                  # REST API (patrz niżej)
├── components/               # UI, wykresy (SVG), widoki stron
└── lib/
    ├── nutrition.ts          # BMI, BMR, TDEE, kalorie, makro, reguły bezpieczeństwa
    ├── mealPlan.ts           # generator jadłospisu (deterministyczny seed)
    ├── workoutPlan.ts        # generator planu treningowego (MET)
    ├── schema.ts             # schemat Zod profilu
    └── data/                 # przepisy i ćwiczenia
```

## REST API

Wszystkie endpointy przyjmują i zwracają JSON. Błędy walidacji zwracają `422` z polem `details`.

Obiekt **profilu** (`profile`):

```json
{
  "sex": "female",            // female | male
  "age": 30,                  // 16–100
  "weight": 72,               // kg, 35–300
  "height": 168,              // cm, 130–230
  "targetWeight": 64,         // kg
  "activity": "light",        // sedentary | light | moderate | active | very_active
  "pace": 0.5,                // kg/tydz., 0.25–1
  "diet": "standard",         // standard | vegetarian | vegan | gluten_free
  "mealsPerDay": 4,           // 3 | 4 | 5
  "fitnessLevel": "beginner", // beginner | intermediate | advanced
  "trainingDays": 3           // 2–6
}
```

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/api/health` | Status usługi |
| `GET` / `POST` | `/api/bmi?weight=80&height=180` lub `{ weight, height }` | BMI, kategoria, zakres prawidłowej wagi |
| `POST` | `/api/nutrition` `{ profile }` | BMR, TDEE, kalorie, makro, woda, termin osiągnięcia celu, ostrzeżenia |
| `POST` | `/api/meal-plan` `{ profile, seed? }` | Jadłospis na 7 dni + lista zakupów (ten sam `seed` = ten sam plan) |
| `POST` | `/api/workout-plan` `{ profile }` | Tygodniowy plan treningowy z szacowanym spalaniem |
| `GET` | `/api/recipes?meal=lunch&diet=vegan&q=tofu&maxKcal=600` | Lista przepisów z filtrami |
| `GET` | `/api/recipes/:id` | Szczegóły przepisu |
| `GET` | `/api/exercises?category=strength&level=beginner` | Lista ćwiczeń |

Przykład:

```bash
curl -X POST http://localhost:3000/api/nutrition \
  -H "Content-Type: application/json" \
  -d '{"profile":{"sex":"female","age":30,"weight":72,"height":168,"targetWeight":64,"activity":"light","pace":0.5,"diet":"standard","mealsPerDay":4,"fitnessLevel":"beginner","trainingDays":3}}'
```

## Jak liczymy

- **BMR** – Mifflin-St Jeor: `10·waga + 6,25·wzrost − 5·wiek + (5 ♂ | −161 ♀)`
- **TDEE** – BMR × współczynnik aktywności (1,2–1,9)
- **Deficyt/nadwyżka** – `tempo × 7700 kcal / 7` dziennie
- **Białko** – 1,6 g/kg (redukcja), 1,3 g/kg (utrzymanie), 1,8 g/kg (masa); przy nadwadze liczone od wagi przy BMI 25
- **Tłuszcze** – 27–28% energii, **węglowodany** – reszta
- **Spalanie w treningu** – `MET × waga × czas` (Compendium of Physical Activities)

### Reguły bezpieczeństwa

- kalorie nigdy poniżej 1200 kcal (kobiety) / 1500 kcal (mężczyźni),
- tempo redukcji maks. ~1% masy ciała tygodniowo, przyrostu maks. 0,5 kg/tydz.,
- brak planu redukcji poniżej dolnej granicy prawidłowej wagi (BMI 18,5) – przy niedowadze plan przechodzi w utrzymanie,
- ostrzeżenia dla osób niepełnoletnich oraz przy BMI < 17 lub ≥ 35.

> ⚠️ MyDietician ma charakter edukacyjny i nie zastępuje porady lekarza ani dietetyka klinicznego.
