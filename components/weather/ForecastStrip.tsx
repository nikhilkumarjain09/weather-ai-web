"use client";

import React, { useState, useEffect } from "react";
import { ForecastDayEntity } from "@/services/weather/types";
import { weatherService } from "@/services/weather/service";
import { useAppStore } from "@/store/useAppStore";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplet,
  ChevronDown,
  ChevronUp,
  X,
  Wind,
  Droplets,
  Zap,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferencesStore } from "@/store/preferencesStore";

interface ForecastStripProps {
  days: ForecastDayEntity[];
  unit: "C" | "F";
  lat?: number;
  lon?: number;
}

export default function ForecastStrip({ days, unit, lat, lon }: ForecastStripProps) {
  const { animationsEnabled } = usePreferencesStore();
  const { apiPlan, showToast } = useAppStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [forecastMode, setForecastMode] = useState<"7" | "14">("7");
  const [proForecast, setProForecast] = useState<ForecastDayEntity[]>([]);
  const [loadingPro, setLoadingPro] = useState(false);

  const iconMap: Record<string, React.ComponentType<any>> = {
    sunny: Sun,
    cloudy: CloudSun,
    rainy: CloudRain,
    windy: Sun,
    snowy: CloudSnow,
    stormy: CloudLightning,
  };

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { weekday: "short" });
  };

  const getFormattedDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  useEffect(() => {
    if (forecastMode === "14" && apiPlan === "pro" && lat !== undefined && lon !== undefined) {
      const fetchProForecast = async () => {
        setLoadingPro(true);
        try {
          const res = await weatherService.getForecast14({ lat, lon });
          if (res.forecast) {
            setProForecast(res.forecast);
          }
        } catch {
          showToast("Failed to retrieve 14-day forecasts", "danger");
        } finally {
          setLoadingPro(false);
        }
      };
      fetchProForecast();
    }
  }, [forecastMode, apiPlan, lat, lon, showToast]);

  const activeDays = forecastMode === "7" || apiPlan === "free" ? days : proForecast;

  // Sparkline coordinates calculations
  const renderSparkline = () => {
    if (!activeDays || activeDays.length < 2) return null;

    const temps = activeDays.map((d) => (d.minTemp + d.maxTemp) / 2);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp || 1;

    const points = activeDays.map((day, i) => {
      const x = 50 + i * (600 / (activeDays.length - 1 || 1));
      const avg = (day.minTemp + day.maxTemp) / 2;
      const ratio = (avg - minTemp) / range;
      const y = 50 - ratio * 40;
      return { x, y };
    });

    const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

    return (
      <div className="hidden lg:block absolute left-0 right-0 top-[110px] h-[60px] pointer-events-none z-10 px-6">
        <svg className="w-full h-full" viewBox="0 0 700 60" preserveAspectRatio="none">
          <path
            d={linePath}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3"
              fill="var(--bg)"
              stroke="var(--accent)"
              strokeWidth="2"
              className="opacity-90"
            />
          ))}
        </svg>
      </div>
    );
  };

  const handleToggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-sm md:text-base font-bold text-text-primary">Forecast Focus</h3>
        <div className="flex bg-surface-raised border border-border/80 rounded-lg p-0.5">
          <button
            onClick={() => setForecastMode("7")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
              forecastMode === "7" ? "bg-accent text-bg" : "text-text-muted hover:text-text-primary"
            }`}
          >
            7-Day
          </button>
          <button
            onClick={() => setForecastMode("14")}
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
              forecastMode === "14" ? "bg-accent text-bg" : "text-text-muted hover:text-text-primary"
            }`}
          >
            14-Day
          </button>
        </div>
      </div>

      <div className="relative">
        {loadingPro ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {forecastMode === "7" && renderSparkline()}

            <div className={`grid gap-3 ${forecastMode === "7" ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-7"}`}>
              {activeDays.map((day, idx) => {
                const IconComponent = iconMap[day.conditionsCode] || Cloud;
                const isExpanded = expandedIndex === idx;

                return (
                  <div
                    key={day.date}
                    onClick={() => handleToggleExpand(idx)}
                    className={`bg-surface-raised border rounded-lg p-3 flex flex-col items-center text-center hover:border-accent/50 transition-all z-20 cursor-pointer ${
                      isExpanded ? "border-accent ring-1 ring-accent/20 bg-accent-tint/10" : "border-border"
                    }`}
                  >
                    <span className="text-xs font-bold text-text-primary">{getDayName(day.date)}</span>
                    <span className="text-[10px] text-text-muted mt-0.5">{getFormattedDate(day.date)}</span>

                    <div className="my-3 text-accent bg-surface border border-border p-2 rounded-full">
                      <IconComponent size={16} />
                    </div>

                    <div className="flex items-center gap-1.5 justify-center mt-1">
                      <span className="font-mono text-xs font-bold text-text-primary">
                        {convertTemp(day.maxTemp)}°
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {convertTemp(day.minTemp)}°
                      </span>
                    </div>

                    {day.precipChance > 0 ? (
                      <div className="flex items-center gap-0.5 mt-2 text-[10px] font-bold text-accent">
                        <Droplet size={10} />
                        <span>{day.precipChance}%</span>
                      </div>
                    ) : (
                      <div className="h-4 mt-2" />
                    )}

                    <div className="text-text-muted hover:text-text-primary mt-2">
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </div>
                  </div>
                );
              })}

              {/* Free Plan Lock Slots overlay if on Free Plan and Mode is 14 */}
              {forecastMode === "14" && apiPlan === "free" && (
                <div className="col-span-full border border-dashed border-border rounded-xl p-5 text-center bg-surface-raised/40 flex flex-col items-center justify-center gap-3 relative mt-4">
                  <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                    <Lock size={16} />
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold text-text-primary">14-Day Forecast Locked</h4>
                    <p className="text-[10px] text-text-muted max-w-sm mt-0.5">
                      Premium extended 14-day forecasts require a Pro Plan credentials config. Update your API plan parameters in the Quota settings to unlock.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Expandable Details Drawer Section */}
      <AnimatePresence>
        {expandedIndex !== null && activeDays[expandedIndex] && (
          <motion.div
            initial={animationsEnabled ? { opacity: 0, height: 0, marginTop: 0 } : {}}
            animate={animationsEnabled ? { opacity: 1, height: "auto", marginTop: 16 } : {}}
            exit={animationsEnabled ? { opacity: 0, height: 0, marginTop: 0 } : {}}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-surface-raised border border-border rounded-lg p-4 font-sans text-xs"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-border/40 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">
                  Weather Details: {getFormattedDate(activeDays[expandedIndex].date)}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-accent-tint/50 border border-accent/20 rounded text-accent font-semibold">
                  {activeDays[expandedIndex].conditionsText}
                </span>
              </div>
              <button
                onClick={() => setExpandedIndex(null)}
                className="text-text-muted hover:text-text-primary p-0.5"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Wind size={14} className="text-text-muted" />
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">Wind projection</span>
                  <span className="font-mono text-xs text-text-primary font-bold">14 km/h</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplets size={14} className="text-text-muted" />
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">Estimated Humidity</span>
                  <span className="font-mono text-xs text-text-primary font-bold">54%</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap size={14} className="text-text-muted" />
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">UV Exposure</span>
                  <span className="font-mono text-xs text-text-primary font-bold">Low (2/10)</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Droplet size={14} className="text-text-muted" />
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">Precip. Risk</span>
                  <span className="font-mono text-xs text-text-primary font-bold">
                    {activeDays[expandedIndex].precipChance}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
