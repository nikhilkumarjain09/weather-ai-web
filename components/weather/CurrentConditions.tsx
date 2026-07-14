"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { CurrentWeatherEntity } from "@/services/weather/types";
import AnimatedWeatherIcon from "@/components/shared/AnimatedWeatherIcon";
import {
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Compass,
  ArrowDown,
  RefreshCw,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  ShieldCheck,
  Zap,
  CloudSun,
} from "lucide-react";

interface CurrentConditionsProps {
  data: CurrentWeatherEntity;
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
  const { userName, activeLocation } = useAppStore();

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return { text: "Good Morning", Icon: Sun };
    } else if (hour >= 12 && hour < 18) {
      return { text: "Good Afternoon", Icon: Sun };
    } else {
      return { text: "Good Evening", Icon: Moon };
    }
  };

  const { text: greetingText } = getGreeting();

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

  const getAqiDetails = (aqiValue?: number) => {
    const val = aqiValue || 38;
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
    { label: "Wind Direction", val: data.windDirection, icon: Compass },
    { label: "Visibility", val: `${data.visibility} km`, icon: Eye },
    { label: "Atmospheric Pressure", val: `${data.pressure} hPa`, icon: ArrowDown },
    { label: "UV Index", val: `${data.uvIndex} Low`, icon: Zap },
    { label: "Cloud Cover", val: `${cloudCover}%`, icon: CloudSun },
    { label: "Sunrise", val: sunTimes.sunrise, icon: Sunrise },
    { label: "Sunset", val: sunTimes.sunset, icon: Sunset },
    { label: "Moon Phase", val: moonPhase, icon: Moon },
  ];

  return (
    <div className="glass-panel p-6 md:p-8 space-y-8 relative overflow-hidden bg-white/40 dark:bg-slate-950/40 border-slate-200/50 dark:border-white/5 shadow-2xl">
      {/* Dynamic top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-accent/10 to-transparent blur-2xl pointer-events-none" />

      {/* Header greeting & refresh */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-white/5 relative z-10">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
            Active Station Analytics
          </span>
          <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
            {greetingText}, <span className="text-accent">{userName || "Explorer"}</span> 👋
          </h2>
          <span className="text-xs text-text-muted font-medium block mt-0.5">
            Focus: {activeLocation?.name || data.locationName}
          </span>
        </div>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-text-muted hover:text-text-primary disabled:opacity-50 hover:scale-105"
        >
          <RefreshCw size={15} className={isRefreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Massive Apple Weather hero temp widget */}
        <div className="lg:col-span-5 flex flex-col items-center text-center p-6 bg-slate-100/40 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl relative overflow-hidden group">
          {/* Subtle background animated sun rays */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
          
          <AnimatedWeatherIcon code={data.conditionsCode} size={64} className="mb-4 text-accent drop-shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
          
          <div className="space-y-1">
            <span className="font-display text-6xl md:text-7xl font-extrabold text-text-primary tracking-tighter block leading-none select-none">
              {convertTemp(data.temp)}°
            </span>
            <span className="block text-sm font-extrabold text-text-primary tracking-tight mt-1 font-display">
              {data.conditionsText}
            </span>
          </div>

          <div className={`mt-5 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-widest ${aqi.color}`}>
            <ShieldCheck size={12} />
            <span>AQI: {aqi.val} • {aqi.label}</span>
          </div>
        </div>

        {/* Detailed Stats Grid Layout */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map((item, idx) => {
            const StatIcon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 hover:border-accent/30 transition-all duration-300 hover:scale-[1.02] shadow-sm"
              >
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-text-muted shrink-0">
                  <StatIcon size={14} className="text-accent" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[9px] uppercase font-bold text-text-muted tracking-wider">
                    {item.label}
                  </span>
                  <span className="font-display text-xs font-bold text-text-primary block leading-none">
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
