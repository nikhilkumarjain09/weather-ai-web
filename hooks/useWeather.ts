import { useQuery } from "@tanstack/react-query";
import { weatherQueries } from "@/services/weather/weather.query";
import { usePreferencesStore } from "@/store/preferencesStore";
import { WeatherRequest } from "@/services/weather/weather.types";

export function useWeather(params: Partial<WeatherRequest>) {
  const { unit, language } = usePreferencesStore();
  
  const requestParams: WeatherRequest = {
    lat: params.lat,
    lon: params.lon,
    days: params.days ?? 7,
    ai: params.ai ?? false,
    units: params.units || (unit.toLowerCase() as any),
    lang: params.lang || (language.toLowerCase() as any),
  };

  return useQuery(weatherQueries.weather(requestParams));
}
export default useWeather;
