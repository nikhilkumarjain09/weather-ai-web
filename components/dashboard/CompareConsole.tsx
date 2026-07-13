"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useFavoritesStore } from "@/store/favoritesStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { WeatherResponse } from "@/services/weather/types";
import { weatherService } from "@/services/weather/service";
import {
  Thermometer,
  Droplets,
  Wind,
  Compass,
  ArrowDown,
  Sparkles,
} from "lucide-react";

export default function CompareConsole() {
  const { savedLocations } = useFavoritesStore();
  const { unit } = usePreferencesStore();

  const [cityAId, setCityAId] = useState(savedLocations[0]?.id || "");
  const [cityBId, setCityBId] = useState(savedLocations[1]?.id || "");

  const [dataA, setDataA] = useState<WeatherResponse | null>(null);
  const [dataB, setDataB] = useState<WeatherResponse | null>(null);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const [errorA, setErrorA] = useState<string | null>(null);
  const [errorB, setErrorB] = useState<string | null>(null);

  const fetchCityA = useCallback(async () => {
    const loc = savedLocations.find((l) => l.id === cityAId);
    if (!loc) return;
    setLoadingA(true);
    setErrorA(null);
    try {
      const res = await weatherService.getWeather({
        lat: loc.lat,
        lon: loc.lon,
        days: 7,
        ai: true,
        units: unit.toLowerCase() as any,
      });
      setDataA(res);
    } catch (e: any) {
      setErrorA(e.message || "Failed to load weather for City A");
    } finally {
      setLoadingA(false);
    }
  }, [cityAId, savedLocations, unit]);

  const fetchCityB = useCallback(async () => {
    const loc = savedLocations.find((l) => l.id === cityBId);
    if (!loc) return;
    setLoadingB(true);
    setErrorB(null);
    try {
      const res = await weatherService.getWeather({
        lat: loc.lat,
        lon: loc.lon,
        days: 7,
        ai: true,
        units: unit.toLowerCase() as any,
      });
      setDataB(res);
    } catch (e: any) {
      setErrorB(e.message || "Failed to load weather for City B");
    } finally {
      setLoadingB(false);
    }
  }, [cityBId, savedLocations, unit]);

  useEffect(() => {
    if (cityAId) fetchCityA();
  }, [cityAId, fetchCityA]);

  useEffect(() => {
    if (cityBId) fetchCityB();
  }, [cityBId, fetchCityB]);

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  const renderMetricRow = (
    label: string,
    valA: string | number,
    valB: string | number,
    Icon: React.ComponentType<any>
  ) => {
    return (
      <div className="grid grid-cols-3 py-3 border-b border-border/40 text-xs items-center">
        <span className="text-text-muted flex items-center gap-1.5 font-medium">
          <Icon size={13} className="text-text-muted/70" />
          {label}
        </span>
        <span className="font-mono font-bold text-text-primary text-center">{valA}</span>
        <span className="font-mono font-bold text-text-primary text-center">{valB}</span>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans space-y-6">
      <div>
        <h3 className="font-display text-base font-bold text-text-primary">Side-by-Side Comparison</h3>
        <p className="text-xs text-text-muted mt-0.5">
          Select two saved locations to evaluate real-time meteorology metrics and AI forecasts.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-raised/40 p-4 rounded-xl border border-border/80">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Primary Location (City A)
          </label>
          <select
            value={cityAId}
            onChange={(e) => setCityAId(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none"
          >
            <option value="">Select a location</option>
            {savedLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Secondary Location (City B)
          </label>
          <select
            value={cityBId}
            onChange={(e) => setCityBId(e.target.value)}
            className="bg-surface border border-border rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none"
          >
            <option value="">Select a location</option>
            {savedLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side by Side layout */}
      <div className="border border-border rounded-xl overflow-hidden bg-bg">
        {/* Table Header */}
        <div className="grid grid-cols-3 py-3.5 bg-surface-raised border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider text-center">
          <span className="text-left pl-4">Metrics Focus</span>
          <span>
            {dataA?.current.locationName || "City A"} {loadingA && "(...)"}
          </span>
          <span>
            {dataB?.current.locationName || "City B"} {loadingB && "(...)"}
          </span>
        </div>

        {/* Diagnostic Errors */}
        {errorA && <div className="p-3 text-xs text-red-500 bg-red-500/10 border-b border-border">{errorA}</div>}
        {errorB && <div className="p-3 text-xs text-red-500 bg-red-500/10 border-b border-border">{errorB}</div>}

        {/* Telemetry rows */}
        <div className="px-4 divide-y divide-border/20">
          {renderMetricRow(
            "Temperature",
            dataA ? `${convertTemp(dataA.current.temp)}°${unit}` : "--",
            dataB ? `${convertTemp(dataB.current.temp)}°${unit}` : "--",
            Thermometer
          )}
          {renderMetricRow(
            "Feels Like",
            dataA ? `${convertTemp(dataA.current.feelsLike)}°${unit}` : "--",
            dataB ? `${convertTemp(dataB.current.feelsLike)}°${unit}` : "--",
            Thermometer
          )}
          {renderMetricRow(
            "Humidity",
            dataA ? `${dataA.current.humidity}%` : "--",
            dataB ? `${dataB.current.humidity}%` : "--",
            Droplets
          )}
          {renderMetricRow(
            "Wind Speed",
            dataA ? `${dataA.current.windSpeed} km/h` : "--",
            dataB ? `${dataB.current.windSpeed} km/h` : "--",
            Wind
          )}
          {renderMetricRow(
            "Wind Direction",
            dataA ? dataA.current.windDirection : "--",
            dataB ? dataB.current.windDirection : "--",
            Compass
          )}
          {renderMetricRow(
            "Atmospheric Pressure",
            dataA ? `${dataA.current.pressure} hPa` : "--",
            dataB ? `${dataB.current.pressure} hPa` : "--",
            ArrowDown
          )}
        </div>
      </div>

      {/* AI Summaries side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI summary City A */}
        <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} />
            AI Report: {dataA?.current.locationName || "City A"}
          </span>
          <p className="text-xs text-text-muted leading-relaxed">
            {dataA?.aiSummary || "No AI report available for this location."}
          </p>
        </div>

        {/* AI summary City B */}
        <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} />
            AI Report: {dataB?.current.locationName || "City B"}
          </span>
          <p className="text-xs text-text-muted leading-relaxed">
            {dataB?.aiSummary || "No AI report available for this location."}
          </p>
        </div>
      </div>
    </div>
  );
}
