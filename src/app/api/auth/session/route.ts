import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, user: null });
    }
    return NextResponse.json({
      success: true,
      user: {
        id: session.userId,
        email: session.email,
        role: session.role,
        full_name: session.fullName,
      },
    });
  } catch (error) {
    console.error("[Session]", error);
    return NextResponse.json({ success: false, user: null });
  }
}
