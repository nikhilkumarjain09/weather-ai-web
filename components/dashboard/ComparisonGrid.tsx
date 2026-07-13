"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CurrentWeather } from "@/lib/types";
import { Layers, MapPin, RefreshCw, X, Thermometer, Wind, Droplets, Sun } from "lucide-react";
import ErrorBanner from "@/components/shared/ErrorBanner";

interface ComparisonCardProps {
  locationId: string;
  name: string;
  lat: number;
  lon: number;
  unit: "C" | "F";
  onRemove: () => void;
}

function ComparisonCard({ name, lat, lon, unit, onRemove }: ComparisonCardProps) {
  const [data, setData] = useState<CurrentWeather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name)}&ai=false`);
      if (!res.ok) {
        throw new Error("HTTP error " + res.status);
      }
      const json = await res.json();
      setData(json.current);
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, [lat, lon, name]);

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-center items-center h-48 animate-pulse">
        <RefreshCw size={24} className="text-text-muted animate-spin" />
        <span className="text-xs text-text-muted mt-2">Fetching location data...</span>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 relative">
        <button onClick={onRemove} className="absolute top-3 right-3 text-text-muted hover:text-text-primary">
          <X size={16} />
        </button>
        <ErrorBanner message={error} onRetry={fetchWeather} />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 relative hover:border-accent/40 transition-colors font-sans">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-text-muted hover:text-text-primary transition-colors p-1 rounded hover:bg-surface-raised"
      >
        <X size={15} />
      </button>

      <div className="flex items-center gap-1.5 text-text-muted mb-2">
        <MapPin size={13} className="text-accent" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Comparison Node</span>
      </div>

      <h4 className="font-display text-base font-bold text-text-primary mb-1 truncate pr-6">{name}</h4>
      <p className="text-xs text-text-muted font-mono mb-4">
        {lat.toFixed(3)}°N, {lon.toFixed(3)}°W
      </p>

      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-3xl font-extrabold text-text-primary">
          {convertTemp(data.temp)}°{unit}
        </span>
        <span className="text-xs text-text-muted font-medium">
          Feels like {convertTemp(data.feelsLike)}°{unit}
        </span>
      </div>

      <div className="bg-surface-raised border border-border rounded-lg p-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 text-text-muted">
          <Droplets size={14} className="text-accent" />
          <div>
            <span className="block text-[9px] font-bold uppercase text-text-muted/75">Humidity</span>
            <span className="font-mono text-text-primary font-bold">{data.humidity}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Wind size={14} className="text-accent" />
          <div>
            <span className="block text-[9px] font-bold uppercase text-text-muted/75">Wind</span>
            <span className="font-mono text-text-primary font-bold">{data.windSpeed} km/h</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Sun size={14} className="text-accent" />
          <div>
            <span className="block text-[9px] font-bold uppercase text-text-muted/75">UV Index</span>
            <span className="font-mono text-text-primary font-bold">{data.uvIndex}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <Thermometer size={14} className="text-accent" />
          <div>
            <span className="block text-[9px] font-bold uppercase text-text-muted/75">Condition</span>
            <span className="text-text-primary font-bold truncate block max-w-[80px]">{data.conditionsText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComparisonGrid() {
  const { savedLocations, comparisonIds, toggleComparisonLocation, unit } = useAppStore();

  const activeComparisonLocations = savedLocations.filter((loc) =>
    comparisonIds.includes(loc.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-text-primary flex items-center gap-2">
            <Layers className="text-accent" size={18} />
            Multi-Location Comparison Grid
          </h2>
          <p className="text-xs text-text-muted font-sans mt-0.5">
            Select locations below to analyze and compare real-time metrics side-by-side.
          </p>
        </div>
      </div>

      {/* Selectors List */}
      <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap gap-2">
        <span className="text-xs font-semibold text-text-muted flex items-center mr-2">Toggle locations:</span>
        {savedLocations.map((loc) => {
          const isSelected = comparisonIds.includes(loc.id);
          return (
            <button
              key={loc.id}
              onClick={() => toggleComparisonLocation(loc.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isSelected
                  ? "bg-accent-tint border-accent text-accent font-semibold"
                  : "bg-surface-raised border-border text-text-muted hover:text-text-primary"
              }`}
            >
              {loc.name}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      {activeComparisonLocations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-surface border-border text-center">
          <Layers className="text-text-muted opacity-40 mb-3" size={32} />
          <h3 className="font-display text-sm font-bold text-text-primary mb-1">No Comparison Node Selected</h3>
          <p className="text-xs text-text-muted max-w-xs mb-4">
            Select at least one location from the list above to instantiate comparison cards.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeComparisonLocations.map((loc) => (
            <ComparisonCard
              key={loc.id}
              locationId={loc.id}
              name={loc.name}
              lat={loc.lat}
              lon={loc.lon}
              unit={unit}
              onRemove={() => toggleComparisonLocation(loc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
