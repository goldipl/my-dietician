import type { Metadata } from "next";
import { WorkoutView } from "@/components/views/WorkoutView";

export const metadata: Metadata = {
  title: "Plan ćwiczeń",
  description: "Tygodniowy plan treningowy i biblioteka ćwiczeń dopasowana do Twojego celu sylwetkowego.",
};

export default function Page() {
  return <WorkoutView />;
}
