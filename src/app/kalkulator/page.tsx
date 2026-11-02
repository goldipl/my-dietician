import type { Metadata } from "next";
import { CalculatorView } from "@/components/views/CalculatorView";

export const metadata: Metadata = {
  title: "Kalkulator BMI i kalorii",
  description: "Oblicz BMI, zapotrzebowanie kaloryczne (BMR, TDEE) i makroskładniki dopasowane do Twojej wagi docelowej.",
};

export default function CalculatorPage() {
  return <CalculatorView />;
}
