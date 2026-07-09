import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jobCreateSchema } from "@/lib/validations";
import { getPaginationParams, buildPaginationMeta } from "@/lib/paginate";
import { convertToIDR, convertFromIDR } from "@/lib/fx-rate";

// POST: Client creates a new job + triggers AI matching
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.role !== "client") {
      return NextResponse.json(
        { success: false, message: "Hanya client yang bisa post job" },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // 1. Zod Validation
    const result = jobCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      );
    }
    const { title, description, category, budget_min, budget_max, deadline, required_skills, experience_level } = result.data;

    // 2. PRD v4.0 §3.2 — Check client's preferred currency for cross-border display
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { userId: session.userId },
      select: { preferredCurrency: true, country: true },
    });

    const displayCurrency = clientProfile?.preferredCurrency || "IDR";
    let finalBudgetMin = budget_min || null;
    let finalBudgetMax = budget_max || null;
    let fxRateAtPosting: number | null = null;

    // If client uses non-IDR currency, convert budget to IDR for storage
    if (displayCurrency !== "IDR" && (budget_min || budget_max)) {
      const { fxRate } = await convertToIDR(1, displayCurrency);
      fxRateAtPosting = fxRate;
      
      if (budget_min) {
        finalBudgetMin = Math.round(budget_min * fxRate);
      }
      if (budget_max) {
        finalBudgetMax = Math.round(budget_max * fxRate);
      }
    }

    // 3. Create job
    const job = await prisma.job.create({
      data: {
        clientUserId: session.userId,
        title,
        description,
        category,
        budgetMin: finalBudgetMin,
        budgetMax: finalBudgetMax,
        deadline: deadline ? new Date(deadline) : null,
        status: "active",
        // PRD v5.3 §6.4 — experience level for AI matching
        experienceLevel: experience_level || null,
        // PRD v4.0 §2.2 — Currency display fields
        displayCurrency,
        fxRateAtPosting,
      },
    });

    // 4. Bulk insert required skills
    await prisma.jobRequiredSkill.createMany({
      data: required_skills.map((sk) => ({
        jobId: job.id,
        skillId: sk.skill_id,
        isMandatory: sk.is_mandatory !== false,
      })),
    });

    // 5. Trigger AI Job Matching in Background
    const { runAiJobMatching } = await import("@/services/ai-matching");
    runAiJobMatching(job.id, category).catch((err) => {
      console.error("Failed to run background AI matching", err);
    });

    return NextResponse.json(
      {
        success: true,
        message: "Job berhasil diposting. AI sedang mencarikan talenta terbaik.",
        data: {
          job_id: job.id,
          status: "active",
          ai_matching_status: "processing",
          display_currency: displayCurrency,
          fx_rate: fxRateAtPosting,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    console.error("[PostJob]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: List all jobs with full PRD §1.3 filter support
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, per_page, skip, take } = getPaginationParams(searchParams);

    const category = searchParams.get("category");
    const skills = searchParams.getAll("skill");
    const minBudget = searchParams.get("min_budget");
    const maxBudget = searchParams.get("max_budget");
    const status = searchParams.get("status") || "active";
    const q = searchParams.get("q");
    const sort = searchParams.get("sort") || "newest";

    // Build where clause
    const where: Prisma.JobWhereInput = { status: status as Prisma.EnumJobStatusFilter };

    if (category) {
      where.category = category as Prisma.EnumTalentCategoryFilter;
    }
    if (skills.length > 0) {
      where.requiredSkills = {
        some: { skill: { name: { in: skills, mode: "insensitive" } } },
      };
    }
    if (minBudget) {
      where.budgetMax = { gte: Number(minBudget) };
    }
    if (maxBudget) {
      where.budgetMin = { lte: Number(maxBudget) };
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "budget_desc") orderBy = { budgetMax: "desc" };
    if (sort === "budget_asc") orderBy = { budgetMin: "asc" };
    if (sort === "deadline_soon") orderBy = { deadline: "asc" };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          client: {
            select: {
              fullName: true,
              clientProfile: {
                select: {
                  companyName: true,
                  country: true,
                  businessVerifiedAt: true,
                },
              },
            },
          },
          requiredSkills: { include: { skill: true } },
        },
        orderBy,
        skip,
        take,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: jobs.map((j) => {
        // PRD v4.0: Include display currency info and verified badge
        const displayBudgetMin = j.displayCurrency !== "IDR" && j.fxRateAtPosting && j.budgetMin
          ? convertFromIDR(Number(j.budgetMin), j.displayCurrency, Number(j.fxRateAtPosting))
          : null;
        const displayBudgetMax = j.displayCurrency !== "IDR" && j.fxRateAtPosting && j.budgetMax
          ? convertFromIDR(Number(j.budgetMax), j.displayCurrency, Number(j.fxRateAtPosting))
          : null;

        return {
          id: j.id,
          title: j.title,
          description: j.description,
          category: j.category,
          budget_min: j.budgetMin,
          budget_max: j.budgetMax,
          // PRD v4.0 §2.2 — Display currency fields
          display_currency: j.displayCurrency,
          display_budget_min: displayBudgetMin,
          display_budget_max: displayBudgetMax,
          fx_rate_at_posting: j.fxRateAtPosting,
          deadline: j.deadline,
          status: j.status,
          created_at: j.createdAt,
          client: {
            full_name: j.client.fullName,
            company_name: j.client.clientProfile?.companyName || null,
            // PRD v4.0: Cross-border client indicators
            country: j.client.clientProfile?.country || "indonesia",
            is_verified: !!j.client.clientProfile?.businessVerifiedAt,
          },
          required_skills: j.requiredSkills.map((rs) => ({
            name: rs.skill.name,
            is_mandatory: rs.isMandatory,
          })),
        };
      }),
      pagination: buildPaginationMeta(total, page, per_page),
    });
  } catch (error) {
    console.error("[ListJobs]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
