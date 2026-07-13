"use client";

import React, { useState, useEffect } from "react";
import { getHistoricalTrends, HistoricalEntry } from "@/lib/historicalStore";
import { TrendingUp, RefreshCw, Thermometer } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";

interface HistoricalTrendChartProps {
  locationName: string;
  unit: "C" | "F";
}

export default function HistoricalTrendChart({ locationName, unit }: HistoricalTrendChartProps) {
  const [data, setData] = useState<HistoricalEntry[]>([]);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [metric, setMetric] = useState<"temp" | "humidity">("temp");

  const loadData = () => {
    const raw = getHistoricalTrends(locationName);
    setData(raw);
  };

  useEffect(() => {
    loadData();
    
    // Listen for custom events when new current condition details are recorded
    window.addEventListener("aeris-data-fetched", loadData);
    return () => window.removeEventListener("aeris-data-fetched", loadData);
  }, [locationName]);

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  // Filter based on selected time range
  const filteredData = data
    .slice(-range)
    .map((d) => ({
      ...d,
      displayVal: metric === "temp" ? convertTemp(d.temp) : d.humidity,
    }));

  if (filteredData.length < 2) {
    return (
      <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="text-accent" size={18} />
            Historical Trends
          </h3>
        </div>
        <EmptyState
          icon={TrendingUp}
          title="Insufficient Historical Data"
          description="We require at least 2 days of cached sessions for this location to map historical trend charts. Make standard queries to accumulate chart points."
        />
      </div>
    );
  }

  // Calculate SVG plot path
  const width = 600;
  const height = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const vals = filteredData.map((d) => d.displayVal);
  const minVal = Math.min(...vals) - 2;
  const maxVal = Math.max(...vals) + 2;
  const valRange = maxVal - minVal || 1;

  const getX = (index: number) => {
    const step = (width - paddingLeft - paddingRight) / (filteredData.length - 1);
    return paddingLeft + index * step;
  };

  const getY = (val: number) => {
    const ratio = (val - minVal) / valRange;
    return height - paddingBottom - ratio * (height - paddingTop - paddingBottom);
  };

  // Construct coordinates
  const points = filteredData.map((d, i) => ({
    x: getX(i),
    y: getY(d.displayVal),
    val: d.displayVal,
    date: new Date(d.timestamp).toLocaleDateString([], { month: "short", day: "numeric" }),
  }));

  // Build SVG Path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${height - paddingBottom}
    L ${points[0].x} ${height - paddingBottom}
    Z
  `;

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
            <TrendingUp className="text-accent" size={18} />
            Historical Trends
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Plotting changes in {metric === "temp" ? "temperature" : "humidity"} for {locationName}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Metric selector */}
          <div className="flex bg-surface-raised p-0.5 rounded border border-border">
            <button
              onClick={() => setMetric("temp")}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                metric === "temp" ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Temp
            </button>
            <button
              onClick={() => setMetric("humidity")}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                metric === "humidity" ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
              }`}
            >
              Humidity
            </button>
          </div>

          {/* Timeframe selector */}
          <div className="flex bg-surface-raised p-0.5 rounded border border-border">
            {([7, 30, 90] as const).map((t) => (
              <button
                key={t}
                onClick={() => setRange(t)}
                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                  range === t ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
                }`}
              >
                {t}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Chart Frame */}
      <div className="w-full overflow-x-auto">
        <svg className="w-full min-w-[500px]" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = minVal + ratio * valRange;
            const y = getY(val);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text-muted font-mono text-[9px] font-semibold"
                >
                  {Math.round(val)}
                  {metric === "temp" ? "°" : "%"}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Line path */}
          <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} className="group/point">
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                className="fill-bg stroke-accent stroke-[2px] cursor-pointer hover:r-5 transition-all"
              />
              {/* Tooltip on hover */}
              <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={p.x - 30}
                  y={p.y - 28}
                  width="60"
                  height="20"
                  rx="3"
                  className="fill-surface stroke-border stroke-[1px]"
                />
                <text
                  x={p.x}
                  y={p.y - 15}
                  textAnchor="middle"
                  className="fill-text-primary font-mono text-[9px] font-extrabold"
                >
                  {p.val}
                  {metric === "temp" ? `°${unit}` : "%"}
                </text>
              </g>
            </g>
          ))}

          {/* X Axis labels */}
          {points.filter((_, i) => i === 0 || i === points.length - 1 || (points.length > 5 && i === Math.floor(points.length / 2))).map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              className="fill-text-muted font-sans text-[9px] font-semibold"
            >
              {p.date}
            </text>
          ))}
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[10px] text-text-muted font-medium">
          * Trends compiled from local query sessions.
        </span>
        <button
          onClick={loadData}
          className="text-accent hover:text-accent/80 text-[10px] font-bold flex items-center gap-1 uppercase transition-colors"
        >
          <RefreshCw size={10} />
          Sync Chart
        </button>
      </div>
    </div>
  );
}
