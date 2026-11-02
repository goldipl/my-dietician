import type { Metadata } from "next";
import { ProgressView } from "@/components/views/ProgressView";

export const metadata: Metadata = {
  title: "Postępy",
  description: "Dziennik wagi z wykresem zmian i postępem w drodze do wagi docelowej.",
};

export default function Page() {
  return <ProgressView />;
}
