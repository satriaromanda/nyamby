import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Pekerjaan Freelance — Job Board Nyamby",
  description: "Jelajahi pekerjaan freelance terbaru untuk talenta digital Indonesia. Dapatkan match AI dan pembayaran escrow aman.",
  alternates: {
    canonical: "/jobs"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
