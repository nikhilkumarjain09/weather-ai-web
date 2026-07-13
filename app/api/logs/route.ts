import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Simple server side log status check or retrieval
  return NextResponse.json({
    status: "active",
    loggingEnabled: true,
    totalIndexedLogs: 18,
    message: "Server logs are piped to client logs. Client stores full logs in localStorage.",
  });
}
