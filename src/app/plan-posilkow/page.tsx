import type { Metadata } from "next";
import { MealPlanView } from "@/components/views/MealPlanView";

export const metadata: Metadata = {
  title: "Plan posiłków",
  description: "Tygodniowy jadłospis dopasowany do Twojego zapotrzebowania kalorycznego i rodzaju diety.",
};

export default function Page() {
  return <MealPlanView />;
}
