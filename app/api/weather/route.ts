import { NextRequest, NextResponse } from "next/server";
import { requestWeatherApi } from "@/lib/weatherClient";
import { getCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const units = searchParams.get("units") || "C";
    const ai = searchParams.get("ai") || "false";
    const days = searchParams.get("days") || "1";

    const isForecast = parseInt(days) > 1;
    const ttl = isForecast ? 900 : 60; // 15 min for forecast, 60s for current

    const cache = getCache();
    let cacheKey = "";
    let apiPath = "";
    const params: Record<string, string> = { units, ai, days };

    if (lat && lon) {
      apiPath = "/v1/weather";
      params.lat = lat;
      params.lon = lon;
      cacheKey = `weather:${parseFloat(lat).toFixed(4)}:${parseFloat(lon).toFixed(4)}:${units}:${ai}:${days}`;
    } else {
      // Resolve client IP for weather-geo
      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("x-real-ip") || "auto";
      apiPath = "/v1/weather-geo";
      params.ip = clientIp;
      cacheKey = `weather-geo:${clientIp}:${units}:${ai}:${days}`;
    }

    // Cache lookup
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      const latency = Date.now() - startTime;
      return NextResponse.json({
        ...cachedData,
        _meta: {
          cache: "hit",
          latency,
          timestamp: Date.now(),
        },
      });
    }

    // Call WeatherAI API
    const data = await requestWeatherApi(apiPath, params);

    // If API returned an error, pass it straight through without caching
    if (data.error) {
      return NextResponse.json(data, { status: data.status || 400 });
    }

    // Cache the successful response
    await cache.set(cacheKey, data, ttl);

    const latency = Date.now() - startTime;
    return NextResponse.json({
      ...data,
      _meta: {
        cache: "miss",
        latency,
        timestamp: Date.now(),
      },
    });
  } catch (error: any) {
    console.error("API error in weather route proxy:", error);
    return NextResponse.json(
      {
        error: {
          code: "PROXY_ERROR",
          message: error.message || "Failed to process proxy weather request.",
        },
      },
      { status: 500 }
    );
  }
}
