import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherData } from "@/lib/weatherClient";
import { getCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    
    // Retrieve coordinates or default to Vercel geo headers / San Francisco fallback
    let latStr = searchParams.get("lat");
    let lonStr = searchParams.get("lon");
    let name = searchParams.get("name") || "";
    const ai = searchParams.get("ai") === "true";

    if (!latStr || !lonStr) {
      // Auto IP detection via Vercel headers
      latStr = req.headers.get("x-vercel-ip-latitude") || "37.7749";
      lonStr = req.headers.get("x-vercel-ip-longitude") || "-122.4194";
      if (!name) {
        const city = req.headers.get("x-vercel-ip-city");
        const country = req.headers.get("x-vercel-ip-country") || "US";
        name = city ? `${decodeURIComponent(city)}, ${country}` : "San Francisco (Auto)";
      }
    } else if (!name) {
      name = `Location (${parseFloat(latStr).toFixed(2)}, ${parseFloat(lonStr).toFixed(2)})`;
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    // Cache key structure: weather:lat:lon:ai
    const cacheKey = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}:ai=${ai}`;
    const cache = getCache();
    
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
      const latency = Date.now() - startTime;
      const response = {
        ...cachedData,
        _meta: {
          cache: "hit" as const,
          latency,
          timestamp: Date.now(),
        },
      };
      return NextResponse.json(response);
    }

    // Cache Miss - Fetch data
    const weatherData = await fetchWeatherData(lat, lon, name, ai);
    
    // Cache for 60s for standard, 15m (900s) if AI is enabled or forecast is retrieved
    const ttl = ai ? 900 : 60;
    await cache.set(cacheKey, weatherData, ttl);

    const latency = Date.now() - startTime;
    const response = {
      ...weatherData,
      _meta: {
        cache: "miss" as const,
        latency,
        timestamp: Date.now(),
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API error in weather route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
