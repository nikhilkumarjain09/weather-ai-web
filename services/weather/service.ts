import { requestWeatherClient } from "./client";
import { API_ENDPOINTS } from "./constants";
import {
  WeatherResponse,
  CurrentResponse,
  HourlyResponse,
  DailyResponse,
  ForecastResponse,
  Forecast14Response,
  InsightsResponse,
  GeoResponse,
  IpLookupResponse,
  UsageResponse,
  WeatherRequest,
  WeatherBaseRequest,
} from "./types";

export const weatherService = {
  getWeather: (params: WeatherRequest) =>
    requestWeatherClient<WeatherResponse>(API_ENDPOINTS.WEATHER, {
      lat: params.lat,
      lon: params.lon,
      days: params.days,
      ai: params.ai,
      units: params.units,
      lang: params.lang,
    }),

  getCurrent: (params: WeatherBaseRequest) =>
    requestWeatherClient<CurrentResponse>(API_ENDPOINTS.CURRENT, {
      lat: params.lat,
      lon: params.lon,
      units: params.units,
      lang: params.lang,
    }),

  getHourly: (params: WeatherBaseRequest) =>
    requestWeatherClient<HourlyResponse>(API_ENDPOINTS.HOURLY, {
      lat: params.lat,
      lon: params.lon,
      units: params.units,
      lang: params.lang,
    }),

  getDaily: (params: WeatherBaseRequest & { days?: number }) =>
    requestWeatherClient<DailyResponse>(API_ENDPOINTS.DAILY, {
      lat: params.lat,
      lon: params.lon,
      days: params.days,
      units: params.units,
      lang: params.lang,
    }),

  getForecast: (params: WeatherBaseRequest & { days?: number }) =>
    requestWeatherClient<ForecastResponse>(API_ENDPOINTS.FORECAST, {
      lat: params.lat,
      lon: params.lon,
      days: params.days,
      units: params.units,
      lang: params.lang,
    }),

  getForecast14: (params: WeatherBaseRequest) =>
    requestWeatherClient<Forecast14Response>(API_ENDPOINTS.FORECAST14, {
      lat: params.lat,
      lon: params.lon,
      units: params.units,
      lang: params.lang,
    }),

  getInsights: (params: WeatherBaseRequest) =>
    requestWeatherClient<InsightsResponse>(API_ENDPOINTS.INSIGHTS, {
      lat: params.lat,
      lon: params.lon,
      units: params.units,
      lang: params.lang,
    }),

  getWeatherByGeo: (params: { lat: number; lon: number } & WeatherBaseRequest) =>
    requestWeatherClient<GeoResponse>(API_ENDPOINTS.GEO, {
      lat: params.lat,
      lon: params.lon,
      units: params.units,
      lang: params.lang,
    }),

  getIpLookup: (ip?: string) =>
    requestWeatherClient<IpLookupResponse>(API_ENDPOINTS.IP_LOOKUP, { ip }),

  getUsage: () =>
    requestWeatherClient<UsageResponse>(API_ENDPOINTS.USAGE),
};
export default weatherService;
