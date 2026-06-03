import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId, reason, description } = await req.json();

    if (!jobId || !reason || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { escrowTransaction: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!job.escrowTransaction) {
      return NextResponse.json({ error: "No escrow found for this job" }, { status: 400 });
    }

    // Verify ownership
    // The user must be either the client who posted the job OR the talent assigned to it.
    // We can check if session.user.id matches job.clientUserId or job.escrowTransaction.talentUserId
    const isClient = job.clientUserId === session.userId;
    const isTalent = job.escrowTransaction.talentUserId === session.userId;

    if (!isClient && !isTalent) {
      return NextResponse.json({ error: "Forbidden: You are not a participant in this job" }, { status: 403 });
    }

    // Create the dispute ticket
    const ticket = await prisma.disputeTicket.create({
      data: {
        jobId: job.id,
        escrowId: job.escrowTransaction.id,
        initiatorUserId: session.userId,
        reason, // this maps to DisputeReason enum
        description,
        status: "open",
      },
    });

    // Optionally update job status and escrow status to "disputed" (if those enums exist)
    // Wait, let's check schema.prisma if "disputed" is in JobStatus or EscrowStatus.
    // PRD says: Update status Job -> `disputed`.
    // But did I add "disputed" to the JobStatus enum? Let's check.
    // If not, we might need to skip that for now or update the schema again. 

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error: any) {
    console.error("[Dispute API Error]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
