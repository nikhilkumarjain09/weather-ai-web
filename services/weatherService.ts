import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WeatherResponse, UsageResponse } from "@/lib/types";

// Types for Alerts/Webhooks Response
export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
}

export interface AlertsResponse {
  subscriptions: WebhookSubscription[];
}

// 1. Weather Fetching Hook (incorporating client cache staleTime settings)
export function useWeatherQuery(lat?: number, lon?: number, ai = false) {
  return useQuery<WeatherResponse, Error>({
    queryKey: ["weather", lat, lon, ai],
    queryFn: async () => {
      let url = `/api/weather?days=7&ai=${ai}`;
      if (lat !== undefined && lon !== undefined) {
        url += `&lat=${lat}&lon=${lon}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || `API error: ${data.error.code}`);
      }
      return data;
    },
    staleTime: 60 * 1000, // 60 seconds stale window
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    retry: 2,
  });
}

// 2. Platform Usage Metrics Hook
export function useUsageQuery() {
  return useQuery<UsageResponse, Error>({
    queryKey: ["usage"],
    queryFn: async () => {
      const res = await fetch("/api/usage");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || `API error: ${data.error.code}`);
      }
      return data;
    },
    staleTime: 15 * 1000, // Refetch usage every 15 seconds
    retry: 1,
  });
}

// 3. Webhook Alerts Query Hook
export function useAlertsQuery() {
  return useQuery<AlertsResponse, Error>({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP error ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error.message || `API error: ${data.error.code}`);
      }
      return data;
    },
    staleTime: 30 * 1000,
    retry: 1,
  });
}

// 4. Webhook Alerts Subscription Mutation Hook
export function useSubscribeAlertMutation() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { url: string; events: string[] }>({
    mutationFn: async (payload) => {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 403 || (data.error && data.error.code === 403)) {
        const err = new Error(
          data.error?.message || data.message || "Webhook alerts require a Pro tier API key"
        );
        (err as any).status = 403;
        throw err;
      }

      if (!res.ok) {
        throw new Error(
          data.error?.message || data.message || `Failed to subscribe: HTTP ${res.status}`
        );
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate query to refetch subscription list
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
