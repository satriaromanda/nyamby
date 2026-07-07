import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cara Kerja Nyamby — 4 Langkah Mulai Karier Freelance",
  description: "Pelajari cara kerja Nyamby: buat profil, dapatkan match AI, kerjakan project dengan escrow aman, dan kembangkan karier.",
  alternates: {
    canonical: "/how-it-works"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
