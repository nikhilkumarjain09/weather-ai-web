import { RequestLog } from "./types";

const STORAGE_KEY = "aeris-request-logs";
const MAX_LOGS = 100; // Cap log size

export const getRequestLogs = (): RequestLog[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading request logs:", e);
    return [];
  }
};

export const addRequestLog = (log: Omit<RequestLog, "id" | "timestamp">): RequestLog[] => {
  if (typeof window === "undefined") return [];
  try {
    const logs = getRequestLogs();
    const newLog: RequestLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newLog, ...logs].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch a custom event to notify stores/components
    window.dispatchEvent(new Event("aeris-logs-updated"));
    return updated;
  } catch (e) {
    console.error("Error adding request log:", e);
    return [];
  }
};

export const clearRequestLogs = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("aeris-logs-updated"));
  } catch (e) {
    console.error("Error clearing request logs:", e);
  }
};

export interface RequestMetrics {
  requestsToday: number;
  avgLatency: number;
  cacheHitRate: number;
}

export const getRequestMetrics = (): RequestMetrics => {
  const logs = getRequestLogs();
  if (logs.length === 0) {
    return { requestsToday: 0, avgLatency: 0, cacheHitRate: 0 };
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const logsToday = logs.filter((log) => log.timestamp.startsWith(todayStr));

  const totalLatency = logs.reduce((sum, log) => sum + log.latency, 0);
  const avgLatency = Math.round(totalLatency / logs.length);

  const cacheHits = logs.filter((log) => log.cache === "hit").length;
  const cacheHitRate = Math.round((cacheHits / logs.length) * 100);

  return {
    requestsToday: logsToday.length,
    avgLatency,
    cacheHitRate,
  };
};
