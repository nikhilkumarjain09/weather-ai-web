import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const plan = process.env.WEATHERAI_PLAN || "free";
  
  if (plan === "free") {
    return NextResponse.json(
      { error: "Pro Gated", message: "Alerts & Webhooks subscriptions are only available on the Pro plan." },
      { status: 403 }
    );
  }

  // Pro plan returns active alert subscriptions
  return NextResponse.json({
    subscriptions: [
      { id: "sub-1", type: "webhook", url: "https://api.company.com/weather-webhook", events: ["alert.storm", "alert.temp_extreme"] },
    ]
  });
}

export async function POST(req: NextRequest) {
  const plan = process.env.WEATHERAI_PLAN || "free";

  if (plan === "free") {
    return NextResponse.json(
      { error: "Pro Gated", message: "Webhooks and SMS alerting require the Pro plan." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Alert subscription created successfully.",
      subscription: {
        id: `sub-${Date.now()}`,
        ...body,
        status: "active",
      }
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
