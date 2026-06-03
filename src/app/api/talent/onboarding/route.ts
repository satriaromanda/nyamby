import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, signToken, setSessionCookie } from "@/lib/auth";
import { generateSkillGapAnalysis } from "@/lib/openai";
import { extractCvText, extractPortfolioContext, truncateText } from "@/lib/enrichment";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "talent") {
      return NextResponse.json(
        { success: false, message: "Hanya talent yang bisa mengisi onboarding" },
        { status: 403 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    const body = contentType.includes("multipart/form-data")
      ? await readMultipartOnboarding(request)
      : await request.json();
    const {
      bio,
      category,
      rate_per_hour,
      rate_per_project,
      availability,
      location,
      portfolio_url,
      portfolio_file,
      cv_file,
      cv_text,
      portfolio_context,
      upload_warning,
      skills,
    } = body;

    if (!category || !skills || skills.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori dan minimal 1 skill wajib diisi" },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existing = await prisma.talentProfile.findUnique({
      where: { userId: session.userId },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Profil sudah ada. Gunakan PATCH untuk update." },
        { status: 400 }
      );
    }

    // Create talent profile
    const profile = await prisma.talentProfile.create({
      data: {
        userId: session.userId,
        bio: bio || null,
        category,
        ratePerHour: rate_per_hour ? Math.min(rate_per_hour, 99999999) : null,
        ratePerProject: rate_per_project ? Math.min(rate_per_project, 99999999) : null,
        availability: availability || "available",
        location: location || null,
        portfolioUrl: portfolio_url || null,
        portfolioFile: portfolio_file || null,
        cvFile: cv_file || null,
        cvText: truncateText(cv_text, 3000),
        portfolioContext: truncateText(portfolio_context, 1000),
      },
    });

    // Link skills
    for (const sk of skills) {
      await prisma.talentSkill.create({
        data: {
          talentProfileId: profile.id,
          skillId: sk.skill_id,
          level: sk.level,
        },
      });
    }

    // Trigger AI Skill Gap Analysis
    const talentSkills = await prisma.talentSkill.findMany({
      where: { talentProfileId: profile.id },
      include: { skill: true },
    });

    const skillNames = talentSkills.map((ts) => ({
      name: ts.skill.name,
      level: ts.level,
    }));

    // Get market demand (count skills in active jobs)
    const activeJobs = await prisma.jobRequiredSkill.findMany({
      where: { job: { status: "active", category } },
      include: { skill: true, job: true },
    });

    const demandMap: Record<string, { count: number; totalBudget: number }> = {};
    for (const jrs of activeJobs) {
      const sn = jrs.skill.name;
      if (!demandMap[sn]) demandMap[sn] = { count: 0, totalBudget: 0 };
      demandMap[sn].count++;
      demandMap[sn].totalBudget += Number(jrs.job.budgetMax || 0);
    }

    const marketDemand = Object.entries(demandMap).map(([skill_name, data]) => ({
      skill_name,
      frequency_in_jobs: data.count,
      avg_budget: data.count > 0 ? Math.round(data.totalBudget / data.count) : 0,
    }));

    const skillGapResult = await generateSkillGapAnalysis(skillNames, category, marketDemand, {
      bio: profile.bio,
      cv_text: profile.cvText,
      portfolio_context: profile.portfolioContext,
    });

    await prisma.skillGapAnalysis.updateMany({
      where: { talentProfileId: profile.id, isLatest: true },
      data: { isLatest: false },
    });

    const analysis = await prisma.skillGapAnalysis.create({
      data: {
        talentProfileId: profile.id,
        recommendedSkills: skillGapResult.recommendations,
        summary: skillGapResult.summary,
        profileCompletenessScore: skillGapResult.profile_completeness_score ?? null,
        isLatest: true,
      },
    });

    // MARK ONBOARDING COMPLETE
    await prisma.user.update({
      where: { id: session.userId },
      data: { onboardingComplete: true },
    });

    // Refresh JWT token
    const newToken = await signToken({
      userId: session.userId,
      email: session.email,
      role: session.role,
      fullName: session.fullName,
      onboardingComplete: true,
    });
    await setSessionCookie(newToken);

    return NextResponse.json(
      {
        success: true,
        message: "Profil berhasil dibuat. AI sedang menganalisis skill gap kamu.",
        data: {
          talent_profile_id: profile.id,
          skill_gap_analysis_id: analysis.id,
          profile_completeness_score: skillGapResult.profile_completeness_score,
          upload_warning: upload_warning || null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[Onboarding]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

async function readMultipartOnboarding(request: NextRequest) {
  const formData = await request.formData();
  const portfolioUrl = stringValue(formData.get("portfolio_url"));
  const cvFile = fileValue(formData.get("cv_file"));
  const portfolioFile = fileValue(formData.get("portfolio_file"));
  const cvResult = cvFile ? await extractCvText(cvFile) : null;
  const portfolioResult = await extractPortfolioContext(portfolioFile, portfolioUrl);
  const warning = [cvResult?.warning, portfolioResult.warning].filter(Boolean).join(" ");

  return {
    bio: stringValue(formData.get("bio")),
    category: stringValue(formData.get("category")),
    rate_per_hour: numberValue(formData.get("rate_per_hour")),
    rate_per_project: numberValue(formData.get("rate_per_project")),
    availability: stringValue(formData.get("availability")),
    location: stringValue(formData.get("location")),
    portfolio_url: portfolioUrl,
    portfolio_file: portfolioResult.fileName,
    cv_file: cvResult?.fileName || null,
    cv_text: cvResult?.text || null,
    portfolio_context: portfolioResult.context,
    upload_warning: warning || null,
    skills: JSON.parse(stringValue(formData.get("skills")) || "[]"),
  };
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function numberValue(value: FormDataEntryValue | null) {
  const rawValue = stringValue(value);
  return rawValue ? Number(rawValue) : null;
}

function fileValue(value: FormDataEntryValue | null) {
  return value instanceof File && value.size > 0 ? value : null;
}
