"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, History, Star, Compass } from "lucide-react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useSearchHistoryStore } from "@/store/searchHistoryStore";
import { useSettingsStore } from "@/store/settingsStore";

// Predefined popular cities suggestion bank
const popularCities = [
  { name: "Tokyo, JP", lat: 35.6762, lon: 139.6503 },
  { name: "Paris, FR", lat: 48.8566, lon: 2.3522 },
  { name: "London, UK", lat: 51.5074, lon: -0.1278 },
  { name: "New York, NY", lat: 40.7128, lon: -74.0060 },
  { name: "San Francisco, CA", lat: 37.7749, lon: -122.4194 },
  { name: "Sydney, AU", lat: -33.8688, lon: 151.2093 },
];

export default function SearchBar() {
  const { addSavedLocation, setActiveLocation, savedLocations } = useFavoritesStore();
  const { recentSearches, addSearchQuery, addRecentSearch } = useSearchHistoryStore();
  const { showToast } = useSettingsStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // '/' Hotkey handler to focus search input
  useEffect(() => {
    function handleSlashFocus(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        const isInput =
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA";
        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    }
    window.addEventListener("keydown", handleSlashFocus);
    return () => window.removeEventListener("keydown", handleSlashFocus);
  }, []);

  // Handle outside click to blur dropdown
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced search simulator matching popular suggestions or coordinate math
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed.length > 1) {
        // Check if coordinates entered: e.g. "37.77, -122.41"
        const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
        const match = trimmed.match(coordRegex);

        if (match) {
          const lat = parseFloat(match[1]);
          const lon = parseFloat(match[3]);
          setResults([{ name: `Coordinates: ${lat}, ${lon}`, lat, lon }]);
          return;
        }

        const matches = popularCities.filter((c) =>
          c.name.toLowerCase().includes(trimmed.toLowerCase())
        );

        if (matches.length === 0) {
          // Fallback custom node generation based on text hashing
          let hash = 0;
          for (let i = 0; i < trimmed.length; i++) {
            hash = trimmed.charCodeAt(i) + ((hash << 5) - hash);
          }
          const lat = parseFloat(((hash % 60) + 10).toFixed(4));
          const lon = parseFloat(((hash % 120) - 60).toFixed(4));
          setResults([{ name: `${trimmed} (Custom Location)`, lat, lon }]);
        } else {
          setResults(matches);
        }
      } else {
        setResults([]);
      }
    }, 250); // 250ms debounce window

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelect = (city: typeof popularCities[0], addToSaved = false) => {
    const isAlreadySaved = savedLocations.some(
      (loc) => loc.lat === city.lat && loc.lon === city.lon
    );

    if (addToSaved) {
      if (isAlreadySaved) {
        showToast(`${city.name} is already saved`, "warning");
      } else {
        addSavedLocation({
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          isDefault: false,
        });
        showToast(`Added ${city.name} to saved locations`, "success");
      }
    } else {
      setActiveLocation({
        id: `temp-${Date.now()}`,
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        isDefault: false,
      });
      addRecentSearch(city);
      addSearchQuery(city.name);
      showToast(`Switched active view to ${city.name}`, "info");
    }

    setQuery("");
    setResults([]);
    setFocused(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const listLength = results.length > 0 ? results.length : recentSearches.length;
    if (listLength === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % listLength);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + listLength) % listLength);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0) {
        const item = results.length > 0 ? results[selectedIndex] : recentSearches[selectedIndex];
        handleSelect(item, false);
      }
    } else if (e.key === "Escape") {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const hasQuery = query.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md font-sans z-30">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 bg-surface-raised border border-border rounded-lg px-3 py-1.5 focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/15 transition-all">
        <Search size={15} className="text-text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a city..."
          value={query}
          onFocus={() => {
            setFocused(true);
            setSelectedIndex(-1);
          }}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none placeholder-text-muted font-sans"
        />
        {hasQuery ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setSelectedIndex(-1);
            }}
            className="text-text-muted hover:text-text-primary p-0.5"
          >
            <X size={13} />
          </button>
        ) : (
          <span className="text-[10px] text-text-muted font-mono bg-surface border border-border px-1.5 py-0.5 rounded select-none shrink-0 pointer-events-none">
            /
          </span>
        )}
      </div>

      {/* Autocomplete & suggestions dropdown menu */}
      {focused && (
        <div className="absolute left-0 right-0 mt-1.5 bg-surface border border-border rounded-lg shadow-xl overflow-hidden divide-y divide-border/20 z-50">
          {/* Autocomplete Query Results */}
          {results.length > 0 ? (
            <div className="py-1">
              <span className="block px-3 py-1 text-[9px] font-bold text-text-muted uppercase tracking-wider">
                Suggestions
              </span>
              {results.map((city, idx) => {
                const isSelected = idx === selectedIndex;
                const isSaved = savedLocations.some(
                  (loc) => loc.lat === city.lat && loc.lon === city.lon
                );
                return (
                  <div
                    key={`${city.lat}-${city.lon}`}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer ${
                      isSelected ? "bg-accent-tint/50" : "hover:bg-surface-raised/40"
                    }`}
                  >
                    <button
                      onClick={() => handleSelect(city, false)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      <MapPin size={13} className="text-accent shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-semibold text-text-primary block truncate">
                          {city.name}
                        </span>
                        <span className="text-[9px] text-text-muted font-mono">
                          {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°W
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect(city, true)}
                      title="Add to saved favorites"
                      className={`p-1 rounded text-text-muted hover:text-accent transition-colors`}
                    >
                      <Star size={13} className={isSaved ? "fill-accent text-accent" : ""} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : recentSearches.length > 0 && !hasQuery ? (
            /* Recent Queries and History lists */
            <div className="py-1">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                  <History size={10} />
                  Recently viewed
                </span>
              </div>
              {recentSearches.map((city, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={`${city.lat}-${city.lon}`}
                    onClick={() => handleSelect(city, false)}
                    className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer ${
                      isSelected ? "bg-accent-tint/50" : "hover:bg-surface-raised/40"
                    }`}
                  >
                    <History size={12} className="text-text-muted shrink-0" />
                    <div className="flex-1 truncate">
                      <span className="text-xs font-medium text-text-primary block truncate">
                        {city.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Popular suggestion indicators */
            <div className="py-1">
              <span className="block px-3 py-1 text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Compass size={10} />
                Popular cities
              </span>
              <div className="grid grid-cols-2 gap-1 p-2">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city, false)}
                    className="flex items-center gap-1.5 p-1.5 rounded bg-surface-raised hover:bg-accent-tint hover:text-accent text-left text-[11px] text-text-muted transition-colors truncate"
                  >
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
