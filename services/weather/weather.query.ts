import { queryOptions } from "@tanstack/react-query";
import { weatherService } from "./weather.service";
import { QUERY_KEYS, CACHE_DURATIONS } from "./weather.constants";
import { WeatherRequest, WeatherBaseRequest } from "./weather.types";

export const weatherQueries = {
  weather: (params: WeatherRequest) =>
    queryOptions({
      queryKey: [QUERY_KEYS.FORECAST, params.lat, params.lon, params.days, params.ai, params.units, params.lang],
      queryFn: () => weatherService.getWeather(params),
      staleTime: CACHE_DURATIONS.FORECAST,
      gcTime: CACHE_DURATIONS.FORECAST + 5 * 60 * 1000,
    }),

  current: (params: WeatherBaseRequest) =>
    queryOptions({
      queryKey: [QUERY_KEYS.CURRENT, params.lat, params.lon, params.units, params.lang],
      queryFn: () => weatherService.getCurrent(params),
      staleTime: CACHE_DURATIONS.CURRENT,
      gcTime: CACHE_DURATIONS.CURRENT + 2 * 60 * 1000,
    }),

  hourly: (params: WeatherBaseRequest) =>
    queryOptions({
      queryKey: [QUERY_KEYS.HOURLY, params.lat, params.lon, params.units, params.lang],
      queryFn: () => weatherService.getHourly(params),
      staleTime: CACHE_DURATIONS.HOURLY,
      gcTime: CACHE_DURATIONS.HOURLY + 3 * 60 * 1000,
    }),

  daily: (params: WeatherBaseRequest & { days?: number }) =>
    queryOptions({
      queryKey: [QUERY_KEYS.DAILY, params.lat, params.lon, params.days, params.units, params.lang],
      queryFn: () => weatherService.getDaily(params),
      staleTime: CACHE_DURATIONS.DAILY,
      gcTime: CACHE_DURATIONS.DAILY + 5 * 60 * 1000,
    }),

  forecast14: (params: WeatherBaseRequest) =>
    queryOptions({
      queryKey: [QUERY_KEYS.FORECAST14, params.lat, params.lon, params.units, params.lang],
      queryFn: () => weatherService.getForecast14(params),
      staleTime: CACHE_DURATIONS.FORECAST14,
      gcTime: CACHE_DURATIONS.FORECAST14 + 5 * 60 * 1000,
    }),

  insights: (params: WeatherBaseRequest) =>
    queryOptions({
      queryKey: [QUERY_KEYS.INSIGHTS, params.lat, params.lon, params.units, params.lang],
      queryFn: () => weatherService.getInsights(params),
      staleTime: CACHE_DURATIONS.INSIGHTS,
      gcTime: CACHE_DURATIONS.INSIGHTS + 10 * 60 * 1000,
    }),

  geo: (params: { lat: number; lon: number } & WeatherBaseRequest) =>
    queryOptions({
      queryKey: [QUERY_KEYS.GEO, params.lat, params.lon, params.units, params.lang],
      queryFn: () => weatherService.getWeatherByGeo(params),
      staleTime: CACHE_DURATIONS.CURRENT,
    }),

  usage: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.USAGE],
      queryFn: () => weatherService.getUsage(),
      staleTime: CACHE_DURATIONS.USAGE,
      gcTime: CACHE_DURATIONS.USAGE + 5 * 60 * 1000,
    }),
};
