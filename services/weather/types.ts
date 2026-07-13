// Enums for API options
export enum WeatherUnit {
  METRIC = "metric",
  IMPERIAL = "imperial",
}

export enum WeatherLang {
  EN = "en",
  ES = "es",
  FR = "fr",
  DE = "de",
}

// Request parameter interfaces
export interface WeatherBaseRequest {
  lat?: number;
  lon?: number;
  units?: WeatherUnit;
  lang?: WeatherLang;
}

export interface WeatherRequest extends WeatherBaseRequest {
  days?: number; // 1-14
  ai?: boolean;
}

export interface CurrentRequest extends WeatherBaseRequest {}

export interface HourlyRequest extends WeatherBaseRequest {}

export interface DailyRequest extends WeatherBaseRequest {
  days?: number;
}

export interface ForecastRequest extends WeatherBaseRequest {
  days?: number;
}

export interface Forecast14Request extends WeatherBaseRequest {}

export interface InsightsRequest extends WeatherBaseRequest {}

export interface GeoRequest extends WeatherBaseRequest {
  lat: number;
  lon: number;
}

export interface IpLookupRequest {
  ip?: string;
}

// Response entity interfaces
export interface CurrentWeatherEntity {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  conditionsCode: string;
  conditionsText: string;
  pressure: number;
  visibility: number;
  precipitation: number;
  locationName: string;
  lat: number;
  lon: number;
  aqi?: number;
  isDay?: number;
}

export interface ForecastDayEntity {
  date: string;
  minTemp: number;
  maxTemp: number;
  conditionsCode: string;
  conditionsText: string;
  precipChance: number;
}

export interface AiInsightsEntity {
  summary: string;
  recommendations: string[];
  risk: string;
  suggestions: string[];
}

export interface IpLookupEntity {
  lat: number;
  lon: number;
  city: string;
  country: string;
  ip: string;
}

// Endpoint Response envelopes
export interface WeatherResponse {
  current: CurrentWeatherEntity;
  forecast: ForecastDayEntity[];
  aiSummary?: string;
  _meta?: {
    cache: "hit" | "miss";
    latency: number;
    timestamp: number;
  };
}

export interface CurrentResponse {
  current: CurrentWeatherEntity;
}

export interface HourlyResponse {
  hourly: {
    time: string;
    temp: number;
    precipChance: number;
    windSpeed: number;
    conditionsCode: string;
  }[];
}

export interface DailyResponse {
  forecast: ForecastDayEntity[];
}

export interface ForecastResponse {
  forecast: ForecastDayEntity[];
}

export interface Forecast14Response {
  forecast: ForecastDayEntity[];
}

export interface InsightsResponse {
  insights: AiInsightsEntity;
}

export interface GeoResponse {
  current: CurrentWeatherEntity;
  forecast: ForecastDayEntity[];
}

export interface IpLookupResponse {
  location: IpLookupEntity;
}

export interface UsageResponse {
  plan: string;
  used: number;
  limit: number;
  resetDays: number;
  remaining?: number;
  aiRequestsRemaining?: number;
  resetDate?: string;
  usagePercentage?: number;
}

// Custom Error interfaces
export interface WeatherApiError {
  code: string;
  message: string;
  status: number;
  rateLimit?: {
    limit: number;
    remaining: number;
    reset: number;
  };
}
