import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Nyamby — Misi & Cerita Kami",
  description: "Nyamby membantu talenta digital Indonesia bertransisi dari nyambi menjadi karir profesional dengan AI matching dan escrow.",
  alternates: {
    canonical: "/perusahaan/tentang"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
