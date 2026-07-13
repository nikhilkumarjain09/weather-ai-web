import { useQuery } from "@tanstack/react-query";
import { weatherQueries } from "@/services/weather/weather.query";
import { usePreferencesStore } from "@/store/preferencesStore";
import { WeatherBaseRequest } from "@/services/weather/weather.types";

export function useDailyForecast(params: Partial<WeatherBaseRequest> & { days?: number }) {
  const { unit, language } = usePreferencesStore();

  const requestParams = {
    lat: params.lat,
    lon: params.lon,
    days: params.days ?? 7,
    units: params.units || (unit.toLowerCase() as any),
    lang: params.lang || (language.toLowerCase() as any),
  };

  return useQuery(weatherQueries.daily(requestParams));
}
export default useDailyForecast;
