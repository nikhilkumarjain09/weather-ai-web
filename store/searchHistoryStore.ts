import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchHistoryState {
  searchHistory: string[];
  recentSearches: { name: string; lat: number; lon: number }[];
  addSearchQuery: (query: string) => void;
  clearSearchHistory: () => void;
  addRecentSearch: (search: { name: string; lat: number; lon: number }) => void;
  clearRecentSearches: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      searchHistory: [],
      recentSearches: [
        { name: "Tokyo, JP", lat: 35.6762, lon: 139.6503 },
        { name: "Paris, FR", lat: 48.8566, lon: 2.3522 },
        { name: "Berlin, DE", lat: 52.5200, lon: 13.4050 },
      ],
      addSearchQuery: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return {};
          const filtered = state.searchHistory.filter((q) => q !== trimmed);
          return { searchHistory: [trimmed, ...filtered].slice(0, 10) };
        }),
      clearSearchHistory: () => set({ searchHistory: [] }),
      addRecentSearch: (search) =>
        set((state) => {
          const filtered = state.recentSearches.filter(
            (item) => item.name !== search.name
          );
          return { recentSearches: [search, ...filtered].slice(0, 5) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "aeris-search-history-store",
    }
  )
);
