import { WeatherResponse } from "./weather.types";

const CACHE_KEYS = {
  LAST_SUCCESSFUL_RESPONSE: "aeris-last-successful-weather",
  LAST_COORDINATES: "aeris-last-coordinates",
  OFFLINE_CACHE: "aeris-offline-cache-data",
} as const;

export function saveLastSuccessfulResponse(data: WeatherResponse): void {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEYS.LAST_SUCCESSFUL_RESPONSE, JSON.stringify(payload));
  } catch (e) {
    console.error("Failed to save weather cache response:", e);
  }
}

export function getLastSuccessfulResponse(): { data: WeatherResponse; timestamp: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEYS.LAST_SUCCESSFUL_RESPONSE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLastCoordinates(lat: number, lon: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEYS.LAST_COORDINATES, JSON.stringify({ lat, lon }));
  } catch (e) {
    console.error("Failed to save coordinates cache:", e);
  }
}

export function getLastCoordinates(): { lat: number; lon: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEYS.LAST_COORDINATES);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
