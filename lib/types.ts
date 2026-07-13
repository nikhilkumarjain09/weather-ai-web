export interface CurrentWeather {
  temp: number; // in Celsius by default
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
  _meta: {
    cache: "hit" | "miss";
    latency: number;
    timestamp: number;
  };
}

export interface SavedLocation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  isDefault: boolean;
}

export interface RequestLog {
  id: string;
  endpoint: string;
  params: string;
  status: number;
  latency: number;
  cache: "hit" | "miss";
  timestamp: string;
}

export interface WeatherAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "danger";
  time: string;
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

export interface QuotaState {
  used: number;
  limit: number;
}
