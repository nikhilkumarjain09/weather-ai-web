import { useQuery } from "@tanstack/react-query";
import { weatherQueries } from "@/services/weather/weather.query";
import { usePreferencesStore } from "@/store/preferencesStore";
import { WeatherBaseRequest } from "@/services/weather/weather.types";

export function useInsights(params: Partial<WeatherBaseRequest>) {
  const { unit, language } = usePreferencesStore();

  const requestParams: WeatherBaseRequest = {
    lat: params.lat,
    lon: params.lon,
    units: params.units || (unit.toLowerCase() as any),
    lang: params.lang || (language.toLowerCase() as any),
  };

  return useQuery(weatherQueries.insights(requestParams));
}
export default useInsights;
