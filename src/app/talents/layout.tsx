import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cari Talenta Digital Indonesia",
  description: "Temukan developer, designer, dan talenta digital terverifikasi dengan AI matching Nyamby.",
  alternates: {
    canonical: "/talents"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
