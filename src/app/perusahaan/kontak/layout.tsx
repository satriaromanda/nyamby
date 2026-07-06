import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hubungi Kami — Kontak Nyamby",
  description: "Hubungi tim Nyamby untuk pertanyaan, kerja sama, dukungan pengguna, atau media inquiry.",
  alternates: {
    canonical: "/perusahaan/kontak"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
