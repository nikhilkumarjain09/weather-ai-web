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
    return () => document.addEventListener("mousedown", handleOutsideClick);
  }, []);

  // Real-time geocoding search querying Nominatim API & falling back to weather-geo proxy
  useEffect(() => {
    const handler = setTimeout(async () => {
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

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5&addressdetails=1`, {
            headers: {
              "User-Agent": "AerisWeatherAI/1.0"
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              const mapped = data.map((item: any) => {
                const name = item.display_name.split(",").slice(0, 3).join(",");
                return {
                  name,
                  lat: parseFloat(item.lat),
                  lon: parseFloat(item.lon)
                };
              });
              setResults(mapped);
            } else {
              setResults([]);
            }
          } else {
            throw new Error("Nominatim call unsuccessful");
          }
        } catch {
          // Fallback to internal weather-geo endpoint proxy
          try {
            const geoRes = await fetch(`/api/v1/weather-geo?city=${encodeURIComponent(trimmed)}`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData && geoData.current) {
                const name = geoData.geo ? `${geoData.geo.city}, ${geoData.geo.country}` : geoData.locationName || trimmed;
                setResults([{ name, lat: geoData.lat, lon: geoData.lon }]);
              }
            }
          } catch {
            // Ultimate fallback to popular suggestions bank
            const matches = popularCities.filter((c) =>
              c.name.toLowerCase().includes(trimmed.toLowerCase())
            );
            setResults(matches);
          }
        }
      } else {
        setResults([]);
      }
    }, 450); // 450ms debounce window to limit server hammering

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

  const triggerLiveLocation = () => {
    window.dispatchEvent(new Event("aeris-detect-location"));
    setFocused(false);
    setQuery("");
  };

  const hasQuery = query.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-md font-sans z-30">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-1.5 focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-accent/15 transition-all">
        <Search size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
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
          className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-400 dark:placeholder-slate-500 font-sans font-medium"
        />
        {hasQuery ? (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setSelectedIndex(-1);
            }}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white p-0.5"
          >
            <X size={13} />
          </button>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 px-1.5 py-0.5 rounded select-none shrink-0 pointer-events-none">
            /
          </span>
        )}
      </div>

      {/* Autocomplete & suggestions dropdown menu */}
      {focused && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-white/5 z-50 backdrop-blur-xl animate-slide-in">
          {/* Dynamic Locate Button */}
          <button
            onClick={triggerLiveLocation}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-all text-left text-xs font-semibold"
          >
            <Compass size={14} className="text-accent animate-pulse shrink-0" />
            <span>Use Current Location</span>
          </button>

          {/* Autocomplete Query Results */}
          {results.length > 0 ? (
            <div className="py-1.5">
              <span className="block px-4 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
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
                    className={`flex items-center justify-between px-4 py-2 cursor-pointer ${
                      isSelected ? "bg-accent/10 text-accent" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <button
                      onClick={() => handleSelect(city, false)}
                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                    >
                      <MapPin size={13} className="text-accent shrink-0" />
                      <div className="truncate">
                        <span className="text-xs font-semibold block truncate text-slate-700 dark:text-slate-200">
                          {city.name}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                          {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°W
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleSelect(city, true)}
                      title="Add to saved favorites"
                      className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-accent transition-colors"
                    >
                      <Star size={13} className={isSaved ? "fill-accent text-accent" : ""} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : recentSearches.length > 0 && !hasQuery ? (
            /* Recent Queries and History lists */
            <div className="py-1.5">
              <div className="flex items-center justify-between px-4 py-1">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
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
                    className={`flex items-center gap-2.5 px-4 py-2 cursor-pointer ${
                      isSelected ? "bg-accent/10 text-accent" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <History size={12} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <div className="flex-1 truncate">
                      <span className="text-xs font-semibold block truncate text-slate-700 dark:text-slate-200">
                        {city.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Popular suggestion indicators */
            <div className="py-1.5">
              <span className="block px-4 py-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Compass size={10} />
                Popular cities
              </span>
              <div className="grid grid-cols-2 gap-1.5 p-3">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city, false)}
                    className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-accent/10 hover:text-accent text-left text-[11px] text-slate-500 dark:text-slate-400 transition-all truncate border border-slate-200/50 dark:border-white/5"
                  >
                    <MapPin size={10} className="shrink-0 text-accent" />
                    <span className="truncate text-slate-700 dark:text-slate-200 font-medium">{city.name}</span>
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
