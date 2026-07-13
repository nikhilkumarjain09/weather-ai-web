import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TemperatureUnit, ThemePreference } from "@/lib/types";

interface PreferencesState {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  toggleUnit: () => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  language: string;
  setLanguage: (lang: string) => void;
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  mapPreference: "radar" | "temperature";
  setMapPreference: (pref: "radar" | "temperature") => void;
  chartPreference: "temp" | "humidity" | "pressure" | "wind" | "rain";
  setChartPreference: (pref: "temp" | "humidity" | "pressure" | "wind" | "rain") => void;
  collapsedSections: string[];
  toggleSectionCollapsed: (sectionId: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      unit: "C",
      setUnit: (unit) => set({ unit }),
      toggleUnit: () => set((state) => ({ unit: state.unit === "C" ? "F" : "C" })),
      theme: "system",
      setTheme: (theme) => set({ theme }),
      language: "en",
      setLanguage: (language) => set({ language }),
      animationsEnabled: true,
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      mapPreference: "temperature",
      setMapPreference: (mapPreference) => set({ mapPreference }),
      chartPreference: "temp",
      setChartPreference: (chartPreference) => set({ chartPreference }),
      collapsedSections: [],
      toggleSectionCollapsed: (sectionId) =>
        set((state) => {
          const exists = state.collapsedSections.includes(sectionId);
          const collapsedSections = exists
            ? state.collapsedSections.filter((id) => id !== sectionId)
            : [...state.collapsedSections, sectionId];
          return { collapsedSections };
        }),
    }),
    {
      name: "aeris-preferences-store",
    }
  )
);
