import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SavedLocation } from "@/lib/types";

interface FavoritesState {
  savedLocations: SavedLocation[];
  activeLocation: SavedLocation | null;
  comparisonIds: string[];
  pinnedIds: string[];
  addSavedLocation: (location: Omit<SavedLocation, "id">) => void;
  removeSavedLocation: (id: string) => void;
  setActiveLocation: (location: SavedLocation | null) => void;
  toggleComparisonLocation: (id: string) => void;
  togglePinnedLocation: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      savedLocations: [
        { id: "default-1", name: "San Francisco, CA", lat: 37.7749, lon: -122.4194, isDefault: true },
        { id: "default-2", name: "New York, NY", lat: 40.7128, lon: -74.0060, isDefault: false },
        { id: "default-3", name: "London, UK", lat: 51.5074, lon: -0.1278, isDefault: false },
      ],
      activeLocation: null,
      comparisonIds: ["default-1", "default-2"],
      pinnedIds: ["default-1"],
      addSavedLocation: (loc) =>
        set((state) => {
          const id = `loc-${Date.now()}`;
          const newLoc = { ...loc, id };
          const updatedList = state.savedLocations.map((item) =>
            loc.isDefault ? { ...item, isDefault: false } : item
          );
          return { savedLocations: [...updatedList, newLoc] };
        }),
      removeSavedLocation: (id) =>
        set((state) => ({
          savedLocations: state.savedLocations.filter((loc) => loc.id !== id),
          activeLocation: state.activeLocation?.id === id ? null : state.activeLocation,
          comparisonIds: state.comparisonIds.filter((cid) => cid !== id),
          pinnedIds: state.pinnedIds.filter((pid) => pid !== id),
        })),
      setActiveLocation: (activeLocation) => set({ activeLocation }),
      toggleComparisonLocation: (id) =>
        set((state) => {
          const exists = state.comparisonIds.includes(id);
          const comparisonIds = exists
            ? state.comparisonIds.filter((cid) => cid !== id)
            : [...state.comparisonIds, id];
          return { comparisonIds };
        }),
      togglePinnedLocation: (id) =>
        set((state) => {
          const exists = state.pinnedIds.includes(id);
          const pinnedIds = exists
            ? state.pinnedIds.filter((pid) => pid !== id)
            : [...state.pinnedIds, id];
          return { pinnedIds };
        }),
    }),
    {
      name: "aeris-favorites-store",
    }
  )
);
