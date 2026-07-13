"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function LocationSearch() {
  const { addSavedLocation, setActiveLocation, showToast } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on '/' keydown
  useEffect(() => {
    function handleSlashKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        // Only run if not in another text input
        const activeEl = document.activeElement;
        const isInput = activeEl?.tagName === "INPUT" || activeEl?.tagName === "TEXTAREA";
        if (!isInput) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    }
    window.addEventListener("keydown", handleSlashKey);
    return () => window.removeEventListener("keydown", handleSlashKey);
  }, []);

  // Predefined mock database of cities
  const mockCities = [
    { name: "Tokyo, JP", lat: 35.6762, lon: 139.6503 },
    { name: "Paris, FR", lat: 48.8566, lon: 2.3522 },
    { name: "Berlin, DE", lat: 52.52, lon: 13.405 },
    { name: "Sydney, AU", lat: -33.8688, lon: 151.2093 },
    { name: "Cairo, EG", lat: 30.0444, lon: 31.2357 },
    { name: "Los Angeles, CA", lat: 34.0522, lon: -118.2437 },
    { name: "Miami, FL", lat: 25.7617, lon: -80.1918 },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length > 1) {
      const filtered = mockCities.filter((city) =>
        city.name.toLowerCase().includes(val.toLowerCase())
      );
      
      // If no match, suggest creating a custom location using entered string
      if (filtered.length === 0) {
        // Generate pseudo-coordinates based on name hash
        let hash = 0;
        for (let i = 0; i < val.length; i++) {
          hash = val.charCodeAt(i) + ((hash << 5) - hash);
        }
        const lat = parseFloat(((hash % 60) + 10).toFixed(4));
        const lon = parseFloat(((hash % 120) - 60).toFixed(4));
        setResults([{ name: `${val} (Custom Node)`, lat, lon }]);
      } else {
        setResults(filtered);
      }
    } else {
      setResults([]);
    }
  };

  const handleSelectCity = (city: typeof mockCities[0], addToSaved = false) => {
    const locItem = {
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      isDefault: false,
    };

    if (addToSaved) {
      addSavedLocation(locItem);
      showToast(`Added ${city.name} to Saved Locations`, "success");
    } else {
      setActiveLocation({
        id: `temp-${Date.now()}`,
        ...locItem,
      });
      showToast(`Switched view to ${city.name}`, "info");
    }

    setQuery("");
    setResults([]);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-md font-sans">
      <div className="flex items-center gap-2 bg-surface-raised border border-border rounded-lg px-3 py-1.5 focus-within:border-accent/40 transition-colors">
        <Search size={16} className="text-text-muted shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search coordinates or cities... (Press '/' to focus)"
          value={query}
          onChange={handleSearchChange}
          className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none placeholder-text-muted"
        />
      </div>

      {/* Results Dropdown */}
      {results.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-surface border border-border rounded-lg shadow-xl overflow-hidden z-50 divide-y divide-border">
          {results.map((city) => (
            <div
              key={`${city.lat}-${city.lon}`}
              className="flex items-center justify-between p-2.5 hover:bg-surface-raised transition-colors group"
            >
              <button
                onClick={() => handleSelectCity(city, false)}
                className="flex items-center gap-2 text-left flex-1 min-w-0"
              >
                <MapPin size={14} className="text-accent shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-semibold text-text-primary block truncate">{city.name}</span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {city.lat.toFixed(3)}°N, {city.lon.toFixed(3)}°W
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleSelectCity(city, true)}
                title="Add to saved locations"
                className="p-1 rounded hover:bg-surface border border-transparent hover:border-border text-text-muted hover:text-accent transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
