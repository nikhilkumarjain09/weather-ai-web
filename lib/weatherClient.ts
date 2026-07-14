const BASE_URL = process.env.WEATHER_AI_BASE_URL || "https://api.weather-ai.co";

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
  status: number;
}

export async function requestWeatherApi(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestInit,
  retries = 2
): Promise<any> {
  const apiKey = process.env.WEATHER_AI_API_KEY || process.env.WEATHERAI_KEY;

  // Construct URL
  const urlPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(urlPath, BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.set(key, String(val));
      }
    });
  }

  const headers = new Headers(options?.headers);
  if (apiKey) {
    headers.set("Authorization", `Bearer ${apiKey}`);
  }
  headers.set("Content-Type", "application/json");

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const res = await fetch(url.toString(), fetchOptions);

    // Simple retry on 500/503
    if ((res.status === 500 || res.status === 503) && retries > 0) {
      console.warn(`WeatherAI API returned status ${res.status}. Retrying in 500ms...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return requestWeatherApi(path, params, options, retries - 1);
    }

    if (!res.ok) {
      let errData: any = {};
      try {
        errData = await res.json();
      } catch {}

      // Normalize error shape to match { error: { code, message } }
      const errorObj = {
        code: errData?.error?.code || errData?.code || String(res.status),
        message: errData?.error?.message || errData?.message || res.statusText || "API call failed",
      };

      return { error: errorObj, status: res.status };
    }

    return await res.json();
  } catch (err: any) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return requestWeatherApi(path, params, options, retries - 1);
    }

    return {
      error: {
        code: "CONNECTION_FAILED",
        message: err.message || "Could not establish connection to WeatherAI.",
      },
      status: 500,
    };
  }
}
