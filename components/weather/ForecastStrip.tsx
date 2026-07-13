"use client";

import React, { useState } from "react";
import { ForecastDay } from "@/lib/types";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferencesStore } from "@/store/preferencesStore";

interface ForecastStripProps {
  days: ForecastDay[];
  unit: "C" | "F";
}

export default function ForecastStrip({ days, unit }: ForecastStripProps) {
  const { animationsEnabled } = usePreferencesStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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

  // Sparkline coordinates calculations
  const renderSparkline = () => {
    if (!days || days.length < 2) return null;

    const temps = days.map((d) => (d.minTemp + d.maxTemp) / 2);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp || 1;

    const points = days.map((day, i) => {
      const x = 50 + i * 100;
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
              r="3.5"
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
      <h3 className="font-display text-base font-bold text-text-primary mb-4">7-Day Forecast</h3>

      <div className="relative">
        {/* SVG Sparkline overlay */}
        {renderSparkline()}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {days.map((day, idx) => {
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
                  <IconComponent size={18} />
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
                  {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Details Drawer Section */}
      <AnimatePresence>
        {expandedIndex !== null && (
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
                  Weather Details: {getFormattedDate(days[expandedIndex].date)}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-accent-tint/50 border border-accent/20 rounded text-accent font-semibold">
                  {days[expandedIndex].conditionsText}
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
                    {days[expandedIndex].precipChance}%
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
