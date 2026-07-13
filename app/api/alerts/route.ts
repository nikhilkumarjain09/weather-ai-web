import { NextRequest, NextResponse } from "next/server";
import { requestWeatherApi } from "@/lib/weatherClient";

export async function GET() {
  try {
    const data = await requestWeatherApi("/v1/webhooks");
    
    if (data.error) {
      return NextResponse.json(data, { status: data.status || 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "PROXY_ERROR",
          message: error.message || "Failed to retrieve webhook subscriptions.",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await requestWeatherApi("/v1/webhooks", undefined, {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (data.error) {
      return NextResponse.json(data, { status: data.status || 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "PROXY_ERROR",
          message: error.message || "Failed to create webhook subscription.",
        },
      },
      { status: 500 }
    );
  }
}
