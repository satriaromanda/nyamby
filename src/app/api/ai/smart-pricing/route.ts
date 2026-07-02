import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET /api/ai/smart-pricing — PRD v3.0 §6.2 + PRD v4.0 §3.4
// Smart Pricing Guidance: aggregation-based pricing recommendations
// PRD v4.0: Added ?market=export mode for cross-border benchmark
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const skillsParam = searchParams.get("skills");
    const level = searchParams.get("level");
    const market = searchParams.get("market"); // PRD v4.0 §3.4

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Parameter 'category' wajib diisi" },
        { status: 400 }
      );
    }

    // ─── PRD v4.0 §3.4: Export Market Mode ─────────────────────────
    if (market === "export") {
      // Benchmark rates from secondary research (SEA freelance market)
      const exportBenchmarks: Record<string, { min: number; max: number; median: number }> = {
        web_dev: { min: 15, max: 50, median: 28 },
        graphic_designer: { min: 12, max: 40, median: 22 },
      };

      const benchmark = exportBenchmarks[category] || exportBenchmarks.web_dev;

      return NextResponse.json({
        success: true,
        data: {
          market: "export",
          category,
          benchmark: {
            per_hour_usd: {
              min: benchmark.min,
              max: benchmark.max,
              median: benchmark.median,
            },
            source: "estimasi riset sekunder SEA freelance market, belum tervalidasi khusus Malaysia",
            confidence: "low — akan diperbarui setelah pilot",
          },
          disclaimer: "Angka ini adalah estimasi awal, bukan data transaksi riil Nyamby. Akan diperbarui otomatis begitu ada cukup data dari job ekspor yang selesai.",
        },
      });
    }

    // ─── Domestic Market Mode (existing logic) ─────────────────────
    const skills = skillsParam ? skillsParam.split(",").map((s) => s.trim()) : [];

    // Build where clause
    const whereClause: Record<string, unknown> = {
      category: category as "web_dev" | "graphic_designer",
      ratePerHour: { not: null },
      availability: { not: "unavailable" as const },
    };

    // Add skill filter if provided
    if (skills.length > 0) {
      whereClause.talentSkills = {
        some: { skill: { name: { in: skills } } },
      };
    }

    // Aggregate hourly rates
    const hourlyBenchmark = await prisma.talentProfile.aggregate({
      _min: { ratePerHour: true },
      _avg: { ratePerHour: true },
      _max: { ratePerHour: true },
      _count: { id: true },
      where: whereClause,
    });

    // Aggregate project rates
    const { ratePerHour: _, ...restWhere } = whereClause;
    const projectWhere = { ...restWhere, ratePerProject: { not: null } };
    const projectBenchmark = await prisma.talentProfile.aggregate({
      _min: { ratePerProject: true },
      _avg: { ratePerProject: true },
      _max: { ratePerProject: true },
      where: projectWhere,
    });

    const sampleSize = hourlyBenchmark._count.id;

    // If sample size too small, fallback to category-only query
    let finalHourly = hourlyBenchmark;
    let finalProject = projectBenchmark;
    let fallbackUsed = false;

    if (sampleSize < 5 && skills.length > 0) {
      fallbackUsed = true;
      const fallbackWhere = {
        category: category as "web_dev" | "graphic_designer",
        ratePerHour: { not: null },
        availability: { not: "unavailable" as const },
      };
      finalHourly = await prisma.talentProfile.aggregate({
        _min: { ratePerHour: true },
        _avg: { ratePerHour: true },
        _max: { ratePerHour: true },
        _count: { id: true },
        where: fallbackWhere,
      });
      const fallbackProjectWhere = {
        category: category as "web_dev" | "graphic_designer",
        ratePerProject: { not: null },
        availability: { not: "unavailable" as const },
      };
      finalProject = await prisma.talentProfile.aggregate({
        _min: { ratePerProject: true },
        _avg: { ratePerProject: true },
        _max: { ratePerProject: true },
        where: fallbackProjectWhere,
      });
    }

    // Generate recommendation text
    const avgRate = finalHourly._avg.ratePerHour ? Number(finalHourly._avg.ratePerHour) : 0;
    const minRate = finalHourly._min.ratePerHour ? Number(finalHourly._min.ratePerHour) : 0;
    const maxRate = finalHourly._max.ratePerHour ? Number(finalHourly._max.ratePerHour) : 0;
    const actualSampleSize = finalHourly._count.id;

    const formatIDR = (amount: number) => `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

    let recommendation = "";
    let marketInsight = "";

    if (actualSampleSize > 0) {
      const rangeMin = Math.round(avgRate * 0.8);
      const rangeMax = Math.round(avgRate * 1.2);
      recommendation = `Berdasarkan ${actualSampleSize} talenta aktif${skills.length > 0 ? ` dengan skill serupa` : ` di kategori ${category}`}, rate pasar saat ini ${formatIDR(rangeMin)}–${formatIDR(rangeMax)}/jam.`;

      if (level === "expert") {
        marketInsight = "Talenta expert biasanya bisa mengenakan rate 30-50% di atas rata-rata kategori.";
      } else if (level === "beginner") {
        marketInsight = "Sebagai pemula, pertimbangkan rate di bawah median untuk membangun portofolio dan ulasan.";
      } else {
        marketInsight = `Rate rata-rata di kategori ini adalah ${formatIDR(avgRate)}/jam${fallbackUsed ? " (data kategori umum, belum cukup data per-skill)." : "."}`;
      }
    } else {
      recommendation = "Belum cukup data talenta untuk memberikan benchmark. Rate akan diperbarui seiring pertumbuhan platform.";
      marketInsight = "Kamu termasuk talenta awal di platform — pertimbangkan rate kompetitif untuk membangun reputasi.";
    }

    return NextResponse.json({
      success: true,
      data: {
        market: "domestic",
        category,
        skill_match: skills,
        level: level || null,
        benchmark: {
          per_hour: {
            min: minRate,
            median: avgRate,
            max: maxRate,
            currency: "IDR",
          },
          per_project: {
            min: finalProject._min.ratePerProject ? Number(finalProject._min.ratePerProject) : 0,
            median: finalProject._avg.ratePerProject ? Number(finalProject._avg.ratePerProject) : 0,
            max: finalProject._max.ratePerProject ? Number(finalProject._max.ratePerProject) : 0,
            currency: "IDR",
          },
        },
        sample_size: actualSampleSize,
        recommendation,
        market_insight: marketInsight,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[SmartPricing]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
