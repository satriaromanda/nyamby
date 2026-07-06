import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://nyamby.id";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/talents`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/global`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/how-it-works`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/fitur/ai-matching`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/fitur/skill-gap`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/fitur/escrow`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/fitur/career-path`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/perusahaan/tentang`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/perusahaan/karier`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/perusahaan/kontak`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/help`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/legal/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/legal/security`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic entries — public talent profiles & active job listings.
  // Wrapped in try/catch so the sitemap still serves statics if DB is down.
  try {
    const [talents, jobs] = await Promise.all([
      prisma.talentProfile.findMany({
        select: { id: true, slug: true },
        take: 1000,
      }),
      prisma.job.findMany({
        where: { status: "active" },
        select: { id: true, createdAt: true },
        take: 1000,
      }),
    ]);

    const talentPages: MetadataRoute.Sitemap = talents.map((t) => ({
      url: `${BASE_URL}/talents/${t.slug || t.id}`,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const jobPages: MetadataRoute.Sitemap = jobs.map((j) => ({
      url: `${BASE_URL}/jobs/${j.id}`,
      lastModified: j.createdAt,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    return [...staticPages, ...talentPages, ...jobPages];
  } catch {
    return staticPages;
  }
}
