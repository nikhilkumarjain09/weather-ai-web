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
      setErrorA(e.message || "We couldn't load the weather details.");
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
      setErrorB(e.message || "We couldn't load the weather details.");
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
    valA: React.ReactNode,
    valB: React.ReactNode,
    Icon: React.ComponentType<any>
  ) => {
    return (
      <div className="grid grid-cols-3 py-3 border-b border-border/40 text-xs items-center">
        <span className="text-text-muted flex items-center gap-1.5 font-medium">
          <Icon size={13} className="text-text-muted/70" />
          {label}
        </span>
        <span className="font-mono font-bold text-text-primary text-center flex justify-center">{valA}</span>
        <span className="font-mono font-bold text-text-primary text-center flex justify-center">{valB}</span>
      </div>
    );
  };

  const skeleton = (
    <div className="h-4 w-12 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded animate-pulse" />
  );

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans space-y-6">
      <div>
        <h3 className="font-display text-base font-bold text-text-primary">Compare cities</h3>
        <p className="text-xs text-text-muted mt-0.5">
          Choose two of your saved cities to compare today&apos;s weather.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-raised/40 p-4 rounded-xl border border-border/80">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            First city
          </label>
          <select
            value={cityAId}
            onChange={(e) => setCityAId(e.target.value)}
            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Choose a city</option>
            {savedLocations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Second city
          </label>
          <select
            value={cityBId}
            onChange={(e) => setCityBId(e.target.value)}
            className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Choose a city</option>
            {savedLocations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">
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
          <span className="text-left pl-4">Details</span>
          <span>
            {dataA?.current.locationName || "First City"} {loadingA && "(...)"}
          </span>
          <span>
            {dataB?.current.locationName || "Second City"} {loadingB && "(...)"}
          </span>
        </div>

        {/* Diagnostic Errors */}
        {errorA && <div className="p-3 text-xs text-red-500 bg-red-500/10 border-b border-border">{errorA}</div>}
        {errorB && <div className="p-3 text-xs text-red-500 bg-red-500/10 border-b border-border">{errorB}</div>}

        {/* Telemetry rows */}
        <div className="px-4 divide-y divide-border/20">
          {renderMetricRow(
            "Temperature",
            dataA ? `${convertTemp(dataA.current.temp)}°${unit}` : skeleton,
            dataB ? `${convertTemp(dataB.current.temp)}°${unit}` : skeleton,
            Thermometer
          )}
          {renderMetricRow(
            "Feels Like",
            dataA ? `${convertTemp(dataA.current.feelsLike)}°${unit}` : skeleton,
            dataB ? `${convertTemp(dataB.current.feelsLike)}°${unit}` : skeleton,
            Thermometer
          )}
          {renderMetricRow(
            "Humidity",
            dataA ? `${dataA.current.humidity}%` : skeleton,
            dataB ? `${dataB.current.humidity}%` : skeleton,
            Droplets
          )}
          {renderMetricRow(
            "Wind Speed",
            dataA ? `${dataA.current.windSpeed} km/h` : skeleton,
            dataB ? `${dataB.current.windSpeed} km/h` : skeleton,
            Wind
          )}
          {renderMetricRow(
            "Wind Direction",
            dataA ? dataA.current.windDirection : skeleton,
            dataB ? dataB.current.windDirection : skeleton,
            Compass
          )}
          {renderMetricRow(
            "Atmospheric Pressure",
            dataA ? `${dataA.current.pressure} hPa` : skeleton,
            dataB ? `${dataB.current.pressure} hPa` : skeleton,
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
            Today&apos;s Weather Story: {dataA?.current.locationName || "First City"}
          </span>
          <p className="text-xs text-text-muted leading-relaxed">
            {dataA?.aiSummary || "No weather story available for this location yet."}
          </p>
        </div>

        {/* AI summary City B */}
        <div className="bg-surface-raised border border-border rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={12} />
            Today&apos;s Weather Story: {dataB?.current.locationName || "Second City"}
          </span>
          <p className="text-xs text-text-muted leading-relaxed">
            {dataB?.aiSummary || "No weather story available for this location yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
