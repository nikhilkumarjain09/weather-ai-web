import { NextRequest, NextResponse } from "next/server";

// 1. Validation Layer for environment credentials
function validateConfig() {
  const apiKey = process.env.WEATHER_AI_API_KEY || process.env.WEATHERAI_KEY;
  const baseUrl = process.env.WEATHER_AI_BASE_URL || "https://api.weather-ai.co";

  if (!apiKey || apiKey === "wai_your_key_here") {
    return {
      valid: false,
      error: "WEATHER_AI_API_KEY is not configured in environment variables. Please check your .env.local file.",
    };
  }

  return {
    valid: true,
    apiKey,
    baseUrl,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const config = validateConfig();
  if (!config.valid) {
    return NextResponse.json(
      {
        error: {
          code: "MISSING_API_KEY",
          message: config.error,
        },
      },
      { status: 500 }
    );
  }

  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const subPath = pathSegments.join("/");

    // Construct the remote Weather-AI endpoint URL
    const targetUrl = new URL(`/v1/${subPath}`, config.baseUrl);

    // Forward incoming query params (lat, lon, days, ai, units, lang, etc.)
    const { searchParams } = new URL(req.url);
    searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${config.apiKey}`);
    headers.set("Content-Type", "application/json");

    const res = await fetch(targetUrl.toString(), {
      method: "GET",
      headers,
    });

    const data = await res.json().catch(() => ({}));

    // Extract rate-limit headers to pass to client
    const responseHeaders = new Headers();
    const rateLimitLimit = res.headers.get("X-RateLimit-Limit") || res.headers.get("x-ratelimit-limit");
    const rateLimitRemaining = res.headers.get("X-RateLimit-Remaining") || res.headers.get("x-ratelimit-remaining");
    const rateLimitReset = res.headers.get("X-RateLimit-Reset") || res.headers.get("x-ratelimit-reset");

    if (rateLimitLimit) responseHeaders.set("X-RateLimit-Limit", rateLimitLimit);
    if (rateLimitRemaining) responseHeaders.set("X-RateLimit-Remaining", rateLimitRemaining);
    if (rateLimitReset) responseHeaders.set("X-RateLimit-Reset", rateLimitReset);

    if (!res.ok) {
      return NextResponse.json(data, {
        status: res.status,
        headers: responseHeaders,
      });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Error inside catch-all proxy router:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROXY_CONNECTION_FAILED",
          message: error.message || "Failed to establish proxy connection to Weather-AI.",
        },
      },
      { status: 502 }
    );
  }
}
