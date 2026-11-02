import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfileProvider } from "@/components/ProfileProvider";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bricolage",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MyDietician – Twój personalny dietetyk",
    template: "%s | MyDietician",
  },
  description:
    "Kalkulator BMI, indywidualne zapotrzebowanie kaloryczne, tygodniowy plan posiłków, przepisy i plan ćwiczeń dopasowany do Twojej wagi docelowej.",
  applicationName: "MyDietician",
  keywords: ["dieta", "BMI", "plan posiłków", "kalkulator kalorii", "ćwiczenia", "odchudzanie", "dietetyk"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f8f6" },
    { media: "(prefers-color-scheme: dark)", color: "#09100c" },
  ],
};

/** Applies the stored theme before first paint to avoid a flash of the wrong theme. */
const themeScript = `try{var t=localStorage.getItem("mydietician:theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <ProfileProvider>
          <div className="flex min-h-dvh flex-col overflow-x-clip">
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-10">{children}</main>
            <Footer />
          </div>
        </ProfileProvider>
      </body>
    </html>
  );
}
