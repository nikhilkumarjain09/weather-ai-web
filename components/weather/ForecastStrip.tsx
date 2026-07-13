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

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <h3 className="font-display text-base font-bold text-text-primary mb-4">7-Day Forecast</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {days.map((day) => {
          const IconComponent = iconMap[day.conditionsCode] || Cloud;
          return (
            <div
              key={day.date}
              className="bg-surface-raised border border-border rounded-lg p-3 flex flex-col items-center text-center hover:border-accent/30 transition-colors"
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
                <div className="h-4 mt-2" /> // layout spacing helper
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
