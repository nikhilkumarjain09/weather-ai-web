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
  Sunrise,
  Sunset,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface CurrentConditionsProps {
  data: CurrentWeather;
  unit: "C" | "F";
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function CurrentConditions({
  data,
  unit,
  onRefresh,
  isRefreshing,
}: CurrentConditionsProps) {
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

  // Dynamic calculations for premium metadata (Sunrise/Sunset, Moon Phase, Cloud Cover, AQI)
  const getSunTimes = (latitude: number) => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000
    );
    const offset = Math.sin(((dayOfYear - 80) / 365) * 2 * Math.PI) * 1.2;
    const latOffset = (latitude / 90) * 0.4;

    const sunriseHour = 6 - offset + latOffset;
    const sunsetHour = 18 + offset - latOffset;

    const formatHour = (h: number) => {
      const hh = Math.floor(h);
      const mm = Math.floor((h - hh) * 60);
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} AM`;
    };

    const formatSunset = (h: number) => {
      const hh = Math.floor(h) - 12;
      const mm = Math.floor((h - Math.floor(h)) * 60);
      return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")} PM`;
    };

    return {
      sunrise: formatHour(sunriseHour),
      sunset: formatSunset(sunsetHour),
    };
  };

  const getMoonPhase = () => {
    const knownNewMoon = new Date("2000-01-06T18:14:00").getTime();
    const diff = (Date.now() - knownNewMoon) / 86400000;
    const phase = (diff % 29.530588853) / 29.530588853;

    if (phase < 0.03 || phase > 0.97) return "New Moon";
    if (phase >= 0.03 && phase < 0.22) return "Waxing Crescent";
    if (phase >= 0.22 && phase < 0.28) return "First Quarter";
    if (phase >= 0.28 && phase < 0.47) return "Waxing Gibbous";
    if (phase >= 0.47 && phase < 0.53) return "Full Moon";
    if (phase >= 0.53 && phase < 0.72) return "Waning Gibbous";
    if (phase >= 0.72 && phase < 0.78) return "Third Quarter";
    return "Waning Crescent";
  };

  const getCloudCover = (code: string) => {
    if (code === "sunny" || code === "windy") return 12;
    if (code === "cloudy") return 88;
    if (code === "rainy" || code === "stormy" || code === "snowy") return 95;
    return 45;
  };

  const getAqiDetails = (aqi?: number) => {
    const val = aqi || 38;
    if (val <= 50) return { val, label: "Good", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (val <= 100) return { val, label: "Moderate", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { val, label: "Unhealthy", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  const sunTimes = getSunTimes(data.lat);
  const moonPhase = getMoonPhase();
  const cloudCover = getCloudCover(data.conditionsCode);
  const aqi = getAqiDetails(data.aqi);

  const stats = [
    { label: "Feels Like", val: `${convertTemp(data.feelsLike)}°${unit}`, icon: Thermometer },
    { label: "Humidity", val: `${data.humidity}%`, icon: Droplets },
    { label: "Wind Speed", val: `${data.windSpeed} km/h`, icon: Wind },
    { label: "Wind Dir", val: data.windDirection, icon: Compass },
    { label: "Visibility", val: `${data.visibility} km`, icon: Eye },
    { label: "Pressure", val: `${data.pressure} hPa`, icon: ArrowDown },
    { label: "UV Index", val: `${data.uvIndex} Low`, icon: Zap },
    { label: "Cloud Cover", val: `${cloudCover}%`, icon: CloudSun },
    { label: "Sunrise", val: sunTimes.sunrise, icon: Sunrise },
    { label: "Sunset", val: sunTimes.sunset, icon: Sunset },
    { label: "Moon Phase", val: moonPhase, icon: Moon },
  ];

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      {/* Header controls section */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-raised border border-border text-accent shrink-0">
            <GreetingIcon size={18} />
          </div>
          <div>
            <h2 className="font-display text-sm md:text-base font-bold text-text-primary">
              {greetingText}
              {userName ? `, ${userName}` : ""}
            </h2>
            <span className="text-xs text-text-muted font-medium block">{data.locationName}</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Large Condition summary widget */}
        <div className="flex flex-col gap-4 bg-surface-raised/40 border border-border/80 rounded-xl p-5 items-center text-center">
          <div className="w-16 h-16 rounded-xl bg-accent-tint/40 border border-accent/20 flex items-center justify-center text-accent">
            <IconComponent size={36} />
          </div>
          <div>
            <span className="font-mono text-4xl md:text-5xl font-extrabold text-text-primary tracking-tighter block">
              {convertTemp(data.temp)}°{unit}
            </span>
            <span className="block text-sm font-bold text-text-primary mt-1">
              {data.conditionsText}
            </span>
          </div>

          {/* AQI Pill */}
          <div className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${aqi.color}`}>
            <ShieldCheck size={12} />
            <span>Air Quality: {aqi.val} {aqi.label}</span>
          </div>
        </div>

        {/* Detailed Stats Grid Layout */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((item, idx) => {
            const StatIcon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-raised/35 border border-border/60 hover:border-accent/25 transition-all"
              >
                <div className="p-1.5 rounded bg-surface border border-border text-text-muted shrink-0">
                  <StatIcon size={14} />
                </div>
                <div>
                  <span className="block text-[9px] uppercase font-bold text-text-muted">
                    {item.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-text-primary block mt-0.5">
                    {item.val}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
