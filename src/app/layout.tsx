import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nyamby — AI-Powered Career Platform untuk Talenta Indonesia",
  description:
    "Platform AI yang membantu talenta digital Indonesia bertransisi dari nyambi menjadi karir profesional. AI Job Matching, Skill Gap Analysis, dan escrow payment.",
  keywords: [
    "freelance Indonesia",
    "AI matching",
    "talenta digital",
    "job matching",
    "skill gap",
    "nyambi",
    "karir freelance",
  ],
  openGraph: {
    title: "Nyamby — Dari Nyambi ke Karir Profesional",
    description:
      "AI-powered platform yang menghubungkan talenta digital Indonesia dengan klien yang tepat.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-50 text-surface-900 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
