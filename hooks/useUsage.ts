import { useQuery } from "@tanstack/react-query";
import { weatherQueries } from "@/services/weather/weather.query";

export function useUsage() {
  return useQuery(weatherQueries.usage());
}
export default useUsage;
