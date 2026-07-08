import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Insight Karier Freelance & Update Produk",
  description: "Artikel, tips karier freelance, update produk, dan cerita komunitas talenta digital Indonesia dari tim Nyamby.",
  alternates: {
    canonical: "/blog"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
