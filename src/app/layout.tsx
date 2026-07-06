import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://nyamby.id"),
  title: {
    default: "Nyamby — AI-Powered Career Platform untuk Talenta Indonesia",
    template: "%s | Nyamby",
  },
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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-icon-57x57.png", sizes: "57x57" },
      { url: "/apple-icon-60x60.png", sizes: "60x60" },
      { url: "/apple-icon-72x72.png", sizes: "72x72" },
      { url: "/apple-icon-76x76.png", sizes: "76x76" },
      { url: "/apple-icon-114x114.png", sizes: "114x114" },
      { url: "/apple-icon-120x120.png", sizes: "120x120" },
      { url: "/apple-icon-144x144.png", sizes: "144x144" },
      { url: "/apple-icon-152x152.png", sizes: "152x152" },
      { url: "/apple-icon-180x180.png", sizes: "180x180" },
    ],
    other: [
      { url: "/android-icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/ms-icon-144x144.png",
  },
  openGraph: {
    title: "Nyamby — Dari Nyambi ke Karir Profesional",
    description:
      "AI-powered platform yang menghubungkan talenta digital Indonesia dengan klien yang tepat.",
    type: "website",
    siteName: "Nyamby",
    locale: "id_ID",
    images: [{ url: "/logo-full.png", width: 1200, height: 630, alt: "Nyamby" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyamby — Dari Nyambi ke Karir Profesional",
    description:
      "AI-powered platform yang menghubungkan talenta digital Indonesia dengan klien yang tepat.",
    images: ["/logo-full.png"],
  },
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://nyamby.id";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Nyamby",
  url: BASE_URL,
  logo: `${BASE_URL}/logo-full.png`,
  description:
    "Platform AI yang membantu talenta digital Indonesia bertransisi dari nyambi menjadi karir profesional.",
  sameAs: [] as string[],
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Nyamby",
  url: BASE_URL,
  inLanguage: "id",
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/jobs?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className={`bg-surface-50 text-surface-900 min-h-screen antialiased ${plusJakartaSans.className}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
