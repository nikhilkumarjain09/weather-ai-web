export interface CurrentWeather {
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
}

export interface ForecastDay {
  date: string;
  minTemp: number;
  maxTemp: number;
  conditionsCode: string;
  conditionsText: string;
  precipChance: number;
}

export interface WeatherResponse {
  current: CurrentWeather;
  forecast: ForecastDay[];
  aiSummary?: string;
  _meta?: {
    cache: "hit" | "miss";
    latency: number;
    timestamp: number;
  };
}

export interface UsageResponse {
  plan: string;
  used: number;
  limit: number;
  resetDays: number;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  status: string;
}

export interface WebhooksResponse {
  subscriptions: WebhookSubscription[];
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  isDefault: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  type: "info" | "alert" | "system";
}

export type ThemePreference = "dark" | "light" | "system";
export type TemperatureUnit = "C" | "F";
export type ApiPlan = "free" | "pro";
