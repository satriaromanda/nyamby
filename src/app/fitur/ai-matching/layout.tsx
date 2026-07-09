import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Job Matching — Rekomendasi Pekerjaan Akurat",
  description: "AI Matching Nyamby menganalisis skill, portfolio, dan pengalaman untuk mencocokkan talenta dengan pekerjaan freelance yang tepat.",
  alternates: {
    canonical: "/fitur/ai-matching"
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
