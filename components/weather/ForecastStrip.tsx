"use client";

import React, { useState, useEffect } from "react";
import { ForecastDayEntity } from "@/services/weather/types";
import { weatherService } from "@/services/weather/service";
import { useAppStore } from "@/store/useAppStore";
import AnimatedWeatherIcon from "@/components/shared/AnimatedWeatherIcon";
import {
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

  const activeDays = (forecastMode === "7" || apiPlan === "free" ? days : proForecast) || [];

  // Sparkline coordinates calculations
  const renderSparkline = () => {
    if (!activeDays || activeDays.length < 2) return null;

    const temps = activeDays.map((d) => (d.minTemp + d.maxTemp) / 2);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp || 1;

    const points = activeDays.map((day, i) => {
      const x = 50 + i * (600 / (activeDays.length - 1 || 1));
      const ratio = (day.minTemp + day.maxTemp - 2 * minTemp) / (2 * range);
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
            stroke="var(--color-accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-60"
          />
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="var(--bg)"
              stroke="var(--color-accent)"
              strokeWidth="2"
              className="opacity-95"
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
    <div className="glass-panel p-6 md:p-8 relative overflow-hidden bg-white/40 dark:bg-slate-950/40 border-slate-200/50 dark:border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
            Coming up
          </span>
          <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
            This week
          </h3>
        </div>
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-0.5">
          <button
            onClick={() => setForecastMode("7")}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              forecastMode === "7" ? "bg-accent text-bg shadow-sm" : "text-text-muted hover:text-text-primary"
            }`}
          >
            7-Day
          </button>
          <button
            onClick={() => {
              if (apiPlan === "free") {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("aeris-show-pro-modal"));
                }
              } else {
                setForecastMode("14");
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              forecastMode === "14" ? "bg-accent text-bg shadow-sm" : "text-text-muted hover:text-text-primary"
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

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
              {activeDays.map((day, idx) => {
                const isExpanded = expandedIndex === idx;

                return (
                  <div
                    key={day.date}
                    onClick={() => handleToggleExpand(idx)}
                    className={`bg-white/5 border rounded-2xl p-4 flex flex-col items-center text-center hover:border-accent/40 transition-all duration-300 z-20 cursor-pointer hover:scale-[1.03] ${
                      isExpanded ? "border-accent ring-1 ring-accent/25 bg-accent-tint/10" : "border-white/5"
                    }`}
                  >
                    <span className="text-xs font-bold text-text-primary tracking-tight font-display">{getDayName(day.date)}</span>
                    <span className="text-[9px] text-text-muted mt-0.5 font-medium">{getFormattedDate(day.date)}</span>

                    <div className="my-4 drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                      <AnimatedWeatherIcon code={day.conditionsCode} size={28} />
                    </div>

                    <div className="flex items-center gap-2 justify-center mt-1">
                      <span className="font-display text-xs font-bold text-text-primary">
                        {convertTemp(day.maxTemp)}°
                      </span>
                      <span className="font-display text-[10px] text-text-muted">
                        {convertTemp(day.minTemp)}°
                      </span>
                    </div>

                    {day.precipChance > 0 ? (
                      <div className="flex items-center gap-0.5 mt-2 text-[9px] font-bold text-accent tracking-wide uppercase">
                        <Droplet size={10} />
                        <span>{day.precipChance}%</span>
                      </div>
                    ) : (
                      <div className="h-4 mt-2" />
                    )}

                    <div className="text-text-muted hover:text-text-primary mt-2">
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </div>
                  </div>
                );
              })}

              {/* Free Plan Lock Slots overlay if on Free Plan and Mode is 14 */}
              {forecastMode === "14" && apiPlan === "free" && (
                <div className="col-span-full border border-dashed border-white/10 rounded-2xl p-6 text-center bg-white/5 flex flex-col items-center justify-center gap-3 relative mt-4">
                  <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent">
                    <Lock size={16} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-display text-xs font-bold text-text-primary">Extended forecast is locked</h4>
                    <p className="text-[10px] text-text-muted max-w-sm">
                      Unlock 14-day forecasts and daily tips by upgrading your active plan.
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
            className="overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-4 font-sans text-xs"
          >
            <div className="flex justify-between items-center pb-2.5 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-text-primary">
                  Today&apos;s weather details: {getFormattedDate(activeDays[expandedIndex].date)}
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
              <div className="flex items-center gap-3">
                <Wind size={15} className="text-accent" />
                <div>
                  <span className="block text-[8px] uppercase font-bold text-text-muted tracking-wider">Wind</span>
                  <span className="font-display text-xs text-text-primary font-bold">14 km/h</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Droplets size={15} className="text-accent" />
                <div>
                  <span className="block text-[8px] uppercase font-bold text-text-muted tracking-wider">Humidity</span>
                  <span className="font-display text-xs text-text-primary font-bold">54%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Zap size={15} className="text-accent" />
                <div>
                  <span className="block text-[8px] uppercase font-bold text-text-muted tracking-wider">UV Index</span>
                  <span className="font-display text-xs text-text-primary font-bold">Low (2/10)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Droplet size={15} className="text-accent" />
                <div>
                  <span className="block text-[8px] uppercase font-bold text-text-muted tracking-wider">Rain risk</span>
                  <span className="font-display text-xs text-text-primary font-bold">
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
