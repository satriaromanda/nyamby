import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id: disputeId } = await params;

    const dispute = await prisma.disputeTicket.findUnique({
      where: { id: disputeId },
      include: {
        job: {
          select: {
            title: true,
            budgetMin: true,
            budgetMax: true,
            client: {
              select: {
                id: true,
                fullName: true,
                email: true,
                clientProfile: {
                  select: {
                    bankCode: true,
                    bankAccount: true,
                    bankAccountName: true,
                  }
                }
              }
            },
          }
        },
        escrow: {
          select: {
            id: true,
            amount: true,
            status: true,
            talent: {
              select: {
                id: true,
                fullName: true,
                email: true,
                talentProfile: {
                  select: {
                    bankCode: true,
                    bankAccount: true,
                    bankAccountName: true,
                  }
                }
              }
            }
          }
        },
        initiator: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          }
        }
      }
    });

    if (!dispute) {
      return NextResponse.json(
        { success: false, message: "Dispute tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: dispute,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    console.error("[AdminDisputeDetailGet]", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

