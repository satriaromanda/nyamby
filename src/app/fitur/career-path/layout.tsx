import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Career Path AI — Rencanakan Jalur Kariermu",
  description: "Rekomendasi jalur karier berbasis AI untuk talenta digital: dari nyambi pertama sampai karir profesional.",
  alternates: {
    canonical: "/fitur/career-path"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
