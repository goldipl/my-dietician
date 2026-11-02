import type { Metadata } from "next";
import { DashboardView } from "@/components/views/DashboardView";

export const metadata: Metadata = {
  title: "Panel",
  description: "Twój dzienny przegląd: kalorie, posiłki, trening i postępy.",
};

export default function Page() {
  return <DashboardView />;
}
