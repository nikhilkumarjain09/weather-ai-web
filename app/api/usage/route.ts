import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const plan = process.env.WEATHERAI_PLAN || "free";
  
  // Mock usage data
  const limit = plan === "pro" ? 50000 : 1000;
  const used = plan === "pro" ? 12450 : 384;

  return NextResponse.json({
    plan,
    used,
    limit,
    resetDays: 18,
  });
}
