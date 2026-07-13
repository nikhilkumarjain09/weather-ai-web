import { WeatherApiError } from "./types";

export class WeatherError extends Error {
  public code: string;
  public status: number;
  public rateLimit?: WeatherApiError["rateLimit"];

  constructor(message: string, code: string, status: number, rateLimit?: WeatherApiError["rateLimit"]) {
    super(message);
    this.name = "WeatherError";
    this.code = code;
    this.status = status;
    this.rateLimit = rateLimit;
  }
}

export function parseWeatherError(status: number, data: any, headers?: Headers): WeatherError {
  let message = data?.error?.message || data?.message || "An unexpected error occurred.";
  let code = data?.error?.code || data?.code || "UNKNOWN_ERROR";

  // Rate limiting headers evaluation
  let rateLimit: WeatherApiError["rateLimit"] | undefined;
  if (headers) {
    const limit = headers.get("X-RateLimit-Limit");
    const remaining = headers.get("X-RateLimit-Remaining");
    const reset = headers.get("X-RateLimit-Reset");
    if (limit && remaining && reset) {
      rateLimit = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  // Map to user-friendly messages
  switch (status) {
    case 401:
      message = "Invalid API key. Please check your system configuration.";
      code = "UNAUTHORIZED";
      break;
    case 403:
      message = "Access forbidden. Webhook configurations and forecasts are locked to your plan.";
      code = "FORBIDDEN";
      break;
    case 404:
      message = "The requested weather coordinate focus point was not found.";
      code = "NOT_FOUND";
      break;
    case 429:
      message = "Quota exceeded. You have reached your Weather-AI request quota limits.";
      code = "RATE_LIMITED";
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      message = "Temporary server issue. Please try again in a few moments.";
      code = "SERVER_ERROR";
      break;
  }

  return new WeatherError(message, code, status, rateLimit);
}
