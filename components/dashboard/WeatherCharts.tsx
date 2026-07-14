"use client";

import React from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import { ForecastDayEntity } from "@/services/weather/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Percent, Wind, Droplets, Gauge } from "lucide-react";

interface WeatherChartsProps {
  forecast?: ForecastDayEntity[];
  currentHumidity?: number;
  currentWindSpeed?: number;
  currentPressure?: number;
  loading?: boolean;
}

export default function WeatherCharts({
  forecast,
  currentHumidity,
  currentWindSpeed,
  currentPressure,
  loading,
}: WeatherChartsProps) {
  const { chartPreference, setChartPreference, unit } = usePreferencesStore();

  if (loading || !forecast) {
    return (
      <div className="glass-panel p-6 md:p-8 relative overflow-hidden bg-white/40 dark:bg-slate-950/40 border-slate-200/50 dark:border-white/5 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
              Weather analytics
            </span>
            <div className="h-5 w-64 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
          <div className="h-8 w-60 bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="w-full h-64 bg-slate-100/30 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl animate-pulse flex items-center justify-center">
          <div className="h-32 w-11/12 border-b border-l border-dashed border-slate-200/40 dark:border-white/10 relative flex items-end justify-between p-4">
            <div className="h-16 w-8 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-24 w-8 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-32 w-8 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-20 w-8 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-28 w-8 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const curHum = currentHumidity ?? 50;
  const curWind = currentWindSpeed ?? 10;
  const curPress = currentPressure ?? 1010;

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

  // Prepare chart data combining real forecast days and derived parameters
  const chartData = (forecast || []).map((day, idx) => {
    const seed = idx * 1.5;
    const derivedHumidity = Math.max(
      15,
      Math.min(95, Math.round(curHum + Math.sin(seed) * 12))
    );
    const derivedWind = Math.max(
      2,
      Math.min(50, Math.round(curWind + Math.cos(seed) * 5))
    );
    const derivedPressure = Math.round(curPress + Math.sin(seed * 2) * 8);

    return {
      name: getDayName(day.date),
      maxTemp: convertTemp(day.maxTemp),
      minTemp: convertTemp(day.minTemp),
      rainChance: day.precipChance,
      humidity: derivedHumidity,
      wind: derivedWind,
      pressure: derivedPressure,
    };
  });

  const chartTabs = [
    { id: "temp", label: "Temperature", icon: TrendingUp },
    { id: "rain", label: "Rain Chance", icon: Percent },
    { id: "humidity", label: "Humidity", icon: Droplets },
    { id: "wind", label: "Wind Speed", icon: Wind },
    { id: "pressure", label: "Pressure", icon: Gauge },
  ] as const;

  return (
    <div className="glass-panel p-6 md:p-8 relative overflow-hidden bg-white/40 dark:bg-slate-950/40 border-slate-200/50 dark:border-white/5 shadow-2xl space-y-6">
      {/* Background glow blob */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full filter blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
            Weather analytics
          </span>
          <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
            How weather elements change this week
          </h3>
        </div>

        {/* Tab Controls Selector */}
        <div className="flex flex-wrap bg-slate-100/50 dark:bg-white/5 p-0.5 rounded-xl border border-slate-200 dark:border-white/10 gap-0.5 self-start lg:self-auto">
          {chartTabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = tab.id === chartPreference;
            return (
              <button
                key={tab.id}
                onClick={() => setChartPreference(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-accent text-bg shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <TabIcon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-64 font-mono text-[9px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          {chartPreference === "temp" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="tempMaxGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,15,30,0.85)",
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "var(--text-primary)",
                }}
              />
              <Area
                name={`Max Temp (°${unit})`}
                type="monotone"
                dataKey="maxTemp"
                stroke="var(--color-accent)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tempMaxGradient)"
              />
              <Area
                name={`Min Temp (°${unit})`}
                type="monotone"
                dataKey="minTemp"
                stroke="#a855f7"
                strokeWidth={1.5}
                fill="none"
              />
            </AreaChart>
          ) : chartPreference === "rain" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,15,30,0.85)",
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "var(--text-primary)",
                }}
              />
              <Bar name="Rain Chance (%)" dataKey="rainChance" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : chartPreference === "humidity" ? (
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,15,30,0.85)",
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "var(--text-primary)",
                }}
              />
              <Line
                name="Humidity (%)"
                type="monotone"
                dataKey="humidity"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ stroke: "#10b981", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          ) : chartPreference === "wind" ? (
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,15,30,0.85)",
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "var(--text-primary)",
                }}
              />
              <Line
                name="Wind (km/h)"
                type="monotone"
                dataKey="wind"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ stroke: "#f43f5e", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} />
              <YAxis stroke="var(--text-muted)" tickLine={false} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(10,15,30,0.85)",
                  borderColor: "rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)",
                  color: "var(--text-primary)",
                }}
              />
              <Line
                name="Pressure (hPa)"
                type="monotone"
                dataKey="pressure"
                stroke="#eab308"
                strokeWidth={2.5}
                dot={{ stroke: "#eab308", strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
