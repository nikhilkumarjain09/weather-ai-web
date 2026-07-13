import { useQuery } from "@tanstack/react-query";
import { weatherQueries } from "@/services/weather/queries";
import { usePreferencesStore } from "@/store/preferencesStore";
import { WeatherBaseRequest } from "@/services/weather/types";

export function useWeatherByGeo(params: { lat: number; lon: number } & Partial<WeatherBaseRequest>) {
  const { unit, language } = usePreferencesStore();

  const requestParams = {
    lat: params.lat,
    lon: params.lon,
    units: params.units || (unit.toLowerCase() as any),
    lang: params.lang || (language.toLowerCase() as any),
  };

  return useQuery(weatherQueries.geo(requestParams));
}
export default useWeatherByGeo;
