import { NextResponse } from "next/server";
import { requestWeatherApi } from "@/lib/weatherClient";

export async function GET() {
  try {
    const data = await requestWeatherApi("/v1/usage");
    
    if (data.error) {
      return NextResponse.json(data, { status: data.status || 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: {
          code: "PROXY_ERROR",
          message: error.message || "Failed to retrieve usage info.",
        },
      },
      { status: 500 }
    );
  }
}
