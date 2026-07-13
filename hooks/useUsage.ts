import { useQuery } from "@tanstack/react-query";
import { weatherQueries } from "@/services/weather/queries";

export function useUsage() {
  return useQuery(weatherQueries.usage());
}
export default useUsage;
