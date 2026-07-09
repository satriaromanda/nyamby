import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Gap Analysis — Petakan Skill Kariermu",
  description: "Analisis gap antara skill kamu dan kebutuhan pasar, lengkap dengan rekomendasi pembelajaran dari AI Nyamby.",
  alternates: {
    canonical: "/fitur/skill-gap"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
