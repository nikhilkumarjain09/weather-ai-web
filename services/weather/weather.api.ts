import { parseWeatherError } from "./weather.errors";

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function requestWeatherClient<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: FetchOptions
): Promise<T> {
  const timeoutMs = options?.timeout || 10000; // 10s default timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Construct search query params
  const url = new URL(`/api${path}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, String(val));
      }
    });
  }

  const fetchOptions: RequestInit = {
    ...options,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  };

  if (process.env.NODE_ENV === "development") {
    console.log(`[Weather-AI Client-Fetch]: ${url.toString()}`);
  }

  try {
    const res = await fetch(url.toString(), fetchOptions);
    clearTimeout(id);

    // Read headers for dev telemetry
    if (res.headers.has("X-RateLimit-Limit")) {
      const limit = res.headers.get("X-RateLimit-Limit");
      const remaining = res.headers.get("X-RateLimit-Remaining");
      const reset = res.headers.get("X-RateLimit-Reset");
      
      // Dispatch an event to update rate limit indicators in the UI
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("aeris-rate-limit-updated", {
            detail: { limit, remaining, reset },
          })
        );
      }
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw parseWeatherError(res.status, data, res.headers);
    }

    return await res.json() as T;
  } catch (err: any) {
    clearTimeout(id);
    if (err.name === "AbortError") {
      throw parseWeatherError(504, { message: "Request timeout. Connection closed." });
    }
    if (err instanceof TypeError) {
      throw parseWeatherError(500, { message: "Network connection failed. Check your internet connection." });
    }
    throw err;
  }
}
