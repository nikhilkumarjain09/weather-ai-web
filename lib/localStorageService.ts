// Strongly-typed keys for platform persistence
export const STORAGE_KEYS = {
  USER_NAME: "aeris-user-name",
  THEME: "aeris-theme",
  UNIT: "aeris-unit",
  LANGUAGE: "aeris-language",
  CURRENT_LOCATION: "aeris-current-location",
  LAST_COORDINATES: "aeris-last-coordinates",
  FAVORITE_CITIES: "aeris-favorite-cities",
  PINNED_CITIES: "aeris-pinned-cities",
  RECENT_SEARCHES: "aeris-recent-searches",
  SEARCH_HISTORY: "aeris-search-history",
  LAST_VIEWED_CITY: "aeris-last-viewed-city",
  DASHBOARD_PREFS: "aeris-dashboard-prefs",
  SIDEBAR_STATE: "aeris-sidebar-state",
  COLLAPSED_CARDS: "aeris-collapsed-cards",
  CHART_PREFERENCE: "aeris-chart-preference",
  ANIMATION_PREFERENCE: "aeris-animation-preference",
  MAP_PREFERENCE: "aeris-map-preference",
  WEATHER_ALERTS_SETTINGS: "aeris-weather-alerts-settings",
  AI_ENABLED: "aeris-ai-enabled",
  LAST_WEATHER_RESPONSE: "aeris-last-weather-response",
  LAST_FORECAST: "aeris-last-forecast",
  OFFLINE_CACHE: "aeris-offline-cache",
  LAST_SUCCESSFUL_API_RESPONSE: "aeris-last-successful-api-response",
  LAST_SYNC_TIME: "aeris-last-sync-time",
  RECENTLY_COMPARED_CITIES: "aeris-recently-compared-cities",
  WEATHER_TIMELINE_STATE: "aeris-weather-timeline-state",
  DEVELOPER_SETTINGS: "aeris-developer-settings",
  USAGE_CACHE: "aeris-usage-cache",
} as const;

export const localStorageService = {
  getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  },

  setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to persist item [${key}] to local storage:`, e);
    }
  },

  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove item [${key}] from local storage:`, e);
    }
  },

  clearAll(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Failed to clear local storage cache:", e);
    }
  },
};
export default localStorageService;
