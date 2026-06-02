import { prisma } from "@/lib/prisma";
import { generateJobMatches } from "@/lib/openai";
import { TalentCategory } from "@prisma/client";

/**
 * Run AI Job Matching asynchronously in the background.
 * Optimized with bulk inserts to prevent N+1 issues.
 */
export async function runAiJobMatching(jobId: string, category: TalentCategory) {
  try {
    const jobWithSkills = await prisma.job.findUnique({
      where: { id: jobId },
      include: { requiredSkills: { include: { skill: true } } },
    });

    if (!jobWithSkills) return;

    const allTalents = await prisma.talentProfile.findMany({
      where: { category },
      include: {
        user: { select: { fullName: true, id: true } },
        talentSkills: { include: { skill: true } },
      },
    });

    if (allTalents.length === 0) return;

    const jobData = {
      title: jobWithSkills.title,
      description: jobWithSkills.description,
      required_skills: jobWithSkills.requiredSkills.map((rs) => rs.skill.name),
      category: jobWithSkills.category,
      budget_range: `${jobWithSkills.budgetMin || 0} - ${jobWithSkills.budgetMax || "Negotiable"} IDR`,
    };

    const talentData = allTalents.map((t) => ({
      id: t.id,
      name: t.user.fullName,
      skills: t.talentSkills.map((ts) => ({ name: ts.skill.name, level: ts.level })),
      category: t.category,
      rate: Number(t.ratePerHour || 0),
      bio: t.bio || "",
      cv_text: t.cvText,
      portfolio_context: t.portfolioContext,
    }));

    // Call OpenAI
    const matches = await generateJobMatches(jobData, talentData);

    if (!matches || matches.length === 0) return;

    // Use transaction for bulk inserts to avoid N+1 DB calls
    await prisma.$transaction(async (tx) => {
      // 1. Bulk Create Matches
      await tx.jobMatch.createMany({
        data: matches.map((match) => ({
          jobId: jobId,
          talentProfileId: match.talent_id,
          matchScore: match.match_score,
          strengths: match.strengths,
          gaps: match.gaps,
          reasoning: match.reasoning,
          portfolioEvidence: match.portfolio_evidence || null,
          recommendation: match.recommendation,
          aiStatus: "completed"
        })),
        skipDuplicates: true,
      });

      // 2. Prepare notifications for valid talents
      const notificationsData: any[] = [];
      for (const match of matches) {
        const talentProfile = allTalents.find((t) => t.id === match.talent_id);
        if (talentProfile) {
          notificationsData.push({
            userId: talentProfile.user.id,
            type: "new_match",
            message: `Ada job baru yang cocok untukmu: ${jobWithSkills.title} (${match.match_score}% match)`,
            relatedJobId: jobId,
          });
        }
      }

      // 3. Bulk Create Notifications
      if (notificationsData.length > 0) {
        await tx.notification.createMany({
          data: notificationsData,
        });
      }
    });

  } catch (error) {
    console.error("[AiJobMatching Service Error]", error);
  }
}
