import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nyamby Global — Hire Verified Indonesian Talent",
  description:
    "Access top-tier, AI-matched Indonesian digital talent at competitive rates. Secure escrow payments, verified professionals, and smart pricing for Malaysian & Southeast Asian businesses.",
  keywords: [
    "hire Indonesian talent",
    "freelance Malaysia",
    "cross-border hiring",
    "Indonesian developers",
    "Indonesian designers",
    "SEA freelance",
    "escrow payment",
    "AI talent matching",
  ],
  openGraph: {
    title: "Nyamby Global — Hire Verified Indonesian Talent",
    description:
      "AI-powered platform connecting Malaysian businesses with verified Indonesian digital talent. Competitive rates, secure escrow, instant AI matching.",
    type: "website",
  },
};

export default function GlobalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div lang="en">{children}</div>;
}
