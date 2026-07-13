"use client";

import React from "react";
import { ForecastDay } from "@/lib/types";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplet,
} from "lucide-react";

interface ForecastStripProps {
  days: ForecastDay[];
  unit: "C" | "F";
}

export default function ForecastStrip({ days, unit }: ForecastStripProps) {
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

  // Sparkline coordinates calculations (visible on 7-column desktop layout)
  const renderSparkline = () => {
    if (!days || days.length < 2) return null;

    const temps = days.map((d) => (d.minTemp + d.maxTemp) / 2);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp || 1;

    // Grid details: 7 columns. Width: 700. Height: 60.
    // Each column width = 100. Center of column i is 50 + i * 100.
    const points = days.map((day, i) => {
      const x = 50 + i * 100;
      const avg = (day.minTemp + day.maxTemp) / 2;
      const ratio = (avg - minTemp) / range;
      // Map Y from 10 to 50
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

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans relative">
      <h3 className="font-display text-base font-bold text-text-primary mb-4">7-Day Forecast</h3>

      <div className="relative">
        {/* SVG Sparkline overlay */}
        {renderSparkline()}

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {days.map((day) => {
            const IconComponent = iconMap[day.conditionsCode] || Cloud;
            return (
              <div
                key={day.date}
                className="bg-surface-raised border border-border rounded-lg p-3 flex flex-col items-center text-center hover:border-accent/30 transition-colors z-20"
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
