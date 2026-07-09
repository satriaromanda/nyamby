import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Karier di Nyamby — Bergabung dengan Tim Kami",
  description: "Lowongan kerja di Nyamby. Bantu kami membangun platform AI career companion untuk talenta digital Indonesia.",
  alternates: {
    canonical: "/perusahaan/karier"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
