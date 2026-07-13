// Query Keys definition
export const QUERY_KEYS = {
  CURRENT: "weather.current",
  DAILY: "weather.daily",
  HOURLY: "weather.hourly",
  FORECAST: "weather.forecast",
  FORECAST14: "weather.forecast14",
  INSIGHTS: "weather.insights",
  GEO: "weather.geo",
  USAGE: "weather.usage",
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  CURRENT: 5 * 60 * 1000,    // 5 minutes
  HOURLY: 10 * 60 * 1000,    // 10 minutes
  DAILY: 30 * 60 * 1000,     // 30 minutes
  FORECAST: 30 * 60 * 1000,  // 30 minutes
  FORECAST14: 30 * 60 * 1000, // 30 minutes
  INSIGHTS: 60 * 60 * 1000,  // 1 hour
  USAGE: 15 * 60 * 1000,     // 15 minutes
} as const;

// API Endpoints constants
export const API_ENDPOINTS = {
  WEATHER: "/v1/weather",
  CURRENT: "/v1/current",
  HOURLY: "/v1/hourly",
  DAILY: "/v1/daily",
  FORECAST: "/v1/forecast",
  FORECAST14: "/v1/forecast14",
  INSIGHTS: "/v1/insights",
  GEO: "/v1/weather-geo",
  IP_LOOKUP: "/v1/ip-lookup",
  USAGE: "/v1/usage",
} as const;
