import { prisma } from "@/lib/prisma";

export async function triggerAiSkillGapUpdate(
  profileId: string, 
  skills: any[], 
  category: string, 
  bio: string | null, 
  cvText: string | null, 
  portfolioContext: string | null
) {
  const { generateSkillGapAnalysis } = await import("@/lib/openai");
  
  // Set existing to not latest
  await prisma.skillGapAnalysis.updateMany({
    where: { talentProfileId: profileId, isLatest: true },
    data: { isLatest: false },
  });

  // Create pending analysis
  const pendingAnalysis = await prisma.skillGapAnalysis.create({
    data: {
      talentProfileId: profileId,
      recommendedSkills: [],
      summary: "AI sedang menganalisis skill gap kamu...",
      isLatest: true,
      aiStatus: "processing"
    },
  });

  // Mock market demand
  const mockMarketDemand = [
    { skill_name: "React", frequency_in_jobs: 150, avg_budget: 5000000 },
    { skill_name: "Node.js", frequency_in_jobs: 120, avg_budget: 6000000 },
    { skill_name: "Figma", frequency_in_jobs: 200, avg_budget: 4500000 },
  ];

  try {
    const aiResult = await generateSkillGapAnalysis(
      skills.map(s => ({ name: s.name, level: s.level || "intermediate" })),
      category,
      mockMarketDemand,
      { bio, cv_text: cvText, portfolio_context: portfolioContext }
    );

    await prisma.skillGapAnalysis.update({
      where: { id: pendingAnalysis.id },
      data: {
        recommendedSkills: aiResult.recommendations,
        summary: aiResult.summary,
        profileCompletenessScore: aiResult.profile_completeness_score || 0,
        aiStatus: "completed"
      },
    });
  } catch (error) {
    console.error("[AiSkillGap Error]", error);
    await prisma.skillGapAnalysis.update({
      where: { id: pendingAnalysis.id },
      data: { aiStatus: "failed", summary: "Gagal menganalisis skill gap." },
    });
  }
}
