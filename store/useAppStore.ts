import { useUiStore } from "./uiStore";
import { usePreferencesStore } from "./preferencesStore";
import { useFavoritesStore } from "./favoritesStore";
import { useSearchHistoryStore } from "./searchHistoryStore";
import { useSettingsStore } from "./settingsStore";

export type { ToastItem } from "./settingsStore";


// Compatibility facade hook mirroring AppState structure
export const useAppStore = () => {
  const ui = useUiStore();
  const prefs = usePreferencesStore();
  const favs = useFavoritesStore();
  const search = useSearchHistoryStore();
  const settings = useSettingsStore();

  return {
    ...ui,
    ...prefs,
    ...favs,
    ...search,
    ...settings,
  };
};

// Facade method for direct store state lookups
useAppStore.getState = () => {
  return {
    ...useUiStore.getState(),
    ...usePreferencesStore.getState(),
    ...useFavoritesStore.getState(),
    ...useSearchHistoryStore.getState(),
    ...useSettingsStore.getState(),
  };
};

// Facade method to route partial state updates to correct store slices
useAppStore.setState = (updates: Record<string, any>) => {
  const uiKeys = ["activeView", "sidebarCollapsed", "activeModal", "commandPaletteOpen"];
  const prefsKeys = [
    "unit",
    "theme",
    "language",
    "animationsEnabled",
    "mapPreference",
    "chartPreference",
    "collapsedSections",
  ];
  const favsKeys = ["savedLocations", "activeLocation", "comparisonIds", "pinnedIds"];
  const searchKeys = ["searchHistory", "recentSearches"];
  const settingsKeys = [
    "userName",
    "apiPlan",
    "notifications",
    "toasts",
    "locationPermission",
    "privacyMode",
  ];

  const uiUpdates: Record<string, any> = {};
  const prefsUpdates: Record<string, any> = {};
  const favsUpdates: Record<string, any> = {};
  const searchUpdates: Record<string, any> = {};
  const settingsUpdates: Record<string, any> = {};

  Object.entries(updates).forEach(([key, val]) => {
    if (uiKeys.includes(key)) uiUpdates[key] = val;
    else if (prefsKeys.includes(key)) prefsUpdates[key] = val;
    else if (favsKeys.includes(key)) favsUpdates[key] = val;
    else if (searchKeys.includes(key)) searchUpdates[key] = val;
    else if (settingsKeys.includes(key)) settingsUpdates[key] = val;
  });

  if (Object.keys(uiUpdates).length > 0) useUiStore.setState(uiUpdates);
  if (Object.keys(prefsUpdates).length > 0) usePreferencesStore.setState(prefsUpdates);
  if (Object.keys(favsUpdates).length > 0) useFavoritesStore.setState(favsUpdates);
  if (Object.keys(searchUpdates).length > 0) useSearchHistoryStore.setState(searchUpdates);
  if (Object.keys(settingsUpdates).length > 0) useSettingsStore.setState(settingsUpdates);
};
