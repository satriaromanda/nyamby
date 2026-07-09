import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import OpenAI from "openai";

const aiApiKey = process.env.AI_API_KEY;
const aiBaseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
const aiModel = process.env.AI_MODEL || "deepseek-chat";

const ai = aiApiKey
  ? new OpenAI({ apiKey: aiApiKey, baseURL: aiBaseUrl })
  : null;

const SYSTEM_PROMPT = `Kamu adalah portfolio reviewer profesional untuk platform freelance Indonesia.
Tugasmu adalah mengevaluasi portofolio talenta digital secara konstruktif.

Evaluasi berdasarkan 4 dimensi:
1. KELENGKAPAN — apakah ada deskripsi proyek, konteks, dan hasil akhir?
2. RELEVANSI — apakah proyek relevan dengan kategori dan skill yang diklaim?
3. KEJELASAN — apakah klien awam bisa memahami value dari karya ini?
4. DAYA JUAL — apakah portofolio ini meyakinkan untuk memenangkan proyek?

RESPON HANYA JSON:
{
  "overall_score": 72,
  "dimensions": {
    "completeness":  { "score": 80, "feedback": "..." },
    "relevance":     { "score": 75, "feedback": "..." },
    "clarity":       { "score": 65, "feedback": "..." },
    "marketability": { "score": 68, "feedback": "..." }
  },
  "strengths": ["kelebihan 1", "kelebihan 2"],
  "improvements": [
    {
      "priority": "high",
      "action": "Tambahkan deskripsi problem yang diselesaikan di setiap proyek",
      "impact": "Meningkatkan daya jual portofolio hingga 40%"
    }
  ],
  "summary": "Ringkasan evaluasi dalam 2-3 kalimat"
}`;

// POST /api/ai/portfolio-analyzer — PRD v3.0 §7.2
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa menggunakan Portfolio Analyzer" },
        { status: 403 }
      );
    }

    const profile = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
      include: {
        talentSkills: { include: { skill: true } },
        // PRD v5.3 §6.7 — structured experience strengthens the analysis
        experiences: { orderBy: { startDate: "desc" }, take: 10 },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "Profil talent tidak ditemukan. Selesaikan onboarding terlebih dahulu." },
        { status: 404 }
      );
    }

    // Check at least one input is available
    if (!profile.portfolioUrl && !profile.portfolioContext && !profile.cvText) {
      return NextResponse.json(
        { success: false, message: "Tidak ada data portofolio untuk dianalisis. Upload portfolio atau CV terlebih dahulu." },
        { status: 400 }
      );
    }

    if (!ai) {
      return NextResponse.json(
        { success: false, message: "AI service tidak tersedia. Hubungi admin." },
        { status: 503 }
      );
    }

    // Build user prompt
    const skills = profile.talentSkills.map((ts) => `${ts.skill.name} (${ts.level})`).join(", ");
    // PRD v5.3 §6.7 — structured experiences as concrete evidence
    const experiencesText =
      profile.experiences.length > 0
        ? profile.experiences
            .map(
              (ex) =>
                `- ${ex.title}${ex.company ? ` @ ${ex.company}` : ""}${
                  ex.techStack.length > 0 ? ` [${ex.techStack.join(", ")}]` : ""
                }${ex.description ? `: ${ex.description}` : ""}`
            )
            .join("\n")
        : "Tidak ada";
    const userPrompt = `Analisis portofolio talenta berikut:

Kategori: ${profile.category}
Skills: ${skills}
Bio: ${profile.bio || "Tidak ada"}
Pengalaman Terstruktur:
${experiencesText}
Portfolio URL: ${profile.portfolioUrl || "Tidak ada"}
Portfolio Context: ${profile.portfolioContext || "Tidak ada"}
CV Text: ${profile.cvText || "Tidak ada"}

Berikan evaluasi menyeluruh berdasarkan 4 dimensi.`;

    const completion = await ai.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content || "";
    
    // Extract JSON from response
    let parsed;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      console.error("[PortfolioAnalyzer] Failed to parse AI response:", raw);
      return NextResponse.json(
        { success: false, message: "AI response tidak valid. Coba lagi." },
        { status: 502 }
      );
    }

    // Validate and clamp scores
    const overallScore = Math.max(0, Math.min(100, parsed.overall_score ?? 50));
    const dimensions = parsed.dimensions || {};
    const strengths = Array.isArray(parsed.strengths) ? parsed.strengths : [];
    const improvements = Array.isArray(parsed.improvements) ? parsed.improvements : [];
    const summary = parsed.summary || "Analisis selesai.";

    // Mark previous analyses as not latest
    await prisma.portfolioAnalysis.updateMany({
      where: { talentProfileId: profile.id, isLatest: true },
      data: { isLatest: false },
    });

    // Save analysis
    const analysis = await prisma.portfolioAnalysis.create({
      data: {
        talentProfileId: profile.id,
        overallScore,
        dimensions,
        strengths,
        improvements,
        summary,
        isLatest: true,
      },
    });

    // Update profile completeness score in latest SkillGapAnalysis if exists
    await prisma.skillGapAnalysis.updateMany({
      where: { talentProfileId: profile.id, isLatest: true },
      data: { profileCompletenessScore: overallScore },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          analysis_id: analysis.id,
          overall_score: overallScore,
          dimensions,
          strengths,
          improvements,
          summary,
          generated_at: analysis.generatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[PortfolioAnalyzer]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
