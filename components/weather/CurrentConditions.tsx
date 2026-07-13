"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { CurrentWeather } from "@/lib/types";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Compass,
  ArrowDown,
  RefreshCw,
  Moon,
} from "lucide-react";

interface CurrentConditionsProps {
  data: CurrentWeather;
  unit: "C" | "F";
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function CurrentConditions({ data, unit, onRefresh, isRefreshing }: CurrentConditionsProps) {
  const { userName } = useAppStore();

  const iconMap: Record<string, React.ComponentType<any>> = {
    sunny: Sun,
    cloudy: CloudSun,
    rainy: CloudRain,
    windy: Wind,
    snowy: CloudSnow,
    stormy: CloudLightning,
  };

  const IconComponent = iconMap[data.conditionsCode] || Cloud;

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: "Good morning", Icon: Sun };
    } else if (hour >= 12 && hour < 18) {
      return { text: "Good afternoon", Icon: Sun };
    } else {
      return { text: "Good evening", Icon: Moon };
    }
  };

  const { text: greetingText, Icon: GreetingIcon } = getGreeting();

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      {/* Greeting Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-raised border border-border text-accent shrink-0">
            <GreetingIcon size={18} />
          </div>
          <div>
            <h2 className="font-display text-sm md:text-base font-bold text-text-primary">
              {greetingText}{userName ? `, ${userName}` : ""}
            </h2>
            <span className="text-xs text-text-muted font-medium block">
              {data.locationName}
            </span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded bg-surface border border-border hover:bg-surface-raised transition-colors text-text-muted hover:text-text-primary disabled:opacity-50 shrink-0"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Hero section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-accent-tint/40 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <IconComponent size={36} />
          </div>
          <div>
            <span className="font-mono text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter block">
              {convertTemp(data.temp)}°{unit}
            </span>
            <span className="block text-sm font-semibold text-text-primary mt-1">
              {data.conditionsText}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2">
            <Thermometer size={16} className="text-text-muted shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-muted">Feels Like</span>
              <span className="font-mono text-xs font-bold text-text-primary">
                {convertTemp(data.feelsLike)}°{unit}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Droplets size={16} className="text-text-muted shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-muted">Humidity</span>
              <span className="font-mono text-xs font-bold text-text-primary">{data.humidity}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={16} className="text-text-muted shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-muted">Wind Speed</span>
              <span className="font-mono text-xs font-bold text-text-primary">{data.windSpeed} km/h</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-text-muted shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-muted">Wind Dir</span>
              <span className="font-mono text-xs font-bold text-text-primary">{data.windDirection}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-text-muted shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-muted">Visibility</span>
              <span className="font-mono text-xs font-bold text-text-primary">{data.visibility} km</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDown size={16} className="text-text-muted shrink-0" />
            <div>
              <span className="block text-[9px] uppercase font-bold text-text-muted">Pressure</span>
              <span className="font-mono text-xs font-bold text-text-primary">{data.pressure} hPa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
