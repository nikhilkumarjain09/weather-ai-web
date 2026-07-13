"use client";

import React from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import AnimatedWeatherIcon from "@/components/shared/AnimatedWeatherIcon";
import { Droplet } from "lucide-react";
import { motion } from "framer-motion";

interface HourlyTimelineProps {
  currentTemp: number;
  minTemp: number;
  maxTemp: number;
  conditionCode: string;
  precipChance: number;
}

export default function HourlyTimeline({
  currentTemp,
  minTemp,
  maxTemp,
  conditionCode,
  precipChance,
}: HourlyTimelineProps) {
  const { unit, animationsEnabled } = usePreferencesStore();

  const convertTemp = (c: number) => {
    if (unit === "F") {
      return Math.round((c * 9) / 5 + 32);
    }
    return Math.round(c);
  };

  // Generate 24 hours starting from current hour
  const currentHour = new Date().getHours();
  const hourlyData = Array.from({ length: 24 }).map((_, i) => {
    const hourVal = (currentHour + i) % 24;
    const ampm = hourVal >= 12 ? "PM" : "AM";
    const displayHour = hourVal % 12 === 0 ? 12 : hourVal % 12;
    const label = i === 0 ? "Now" : `${displayHour} ${ampm}`;

    const rad = ((hourVal - 10) / 24) * 2 * Math.PI;
    const tempOffset = (Math.sin(rad) + 1) / 2;
    const rawTemp = minTemp + (maxTemp - minTemp) * tempOffset;
    const temp = i === 0 ? currentTemp : Math.round(rawTemp);

    const rainOffset = Math.sin((hourVal / 24) * Math.PI) * 15;
    const rain = Math.max(0, Math.min(100, Math.round(precipChance + rainOffset)));

    const windOffset = Math.cos((hourVal / 24) * Math.PI) * 4;
    const wind = Math.max(2, Math.round(12 + windOffset));

    return {
      label,
      temp,
      rain,
      wind,
    };
  });

  return (
    <div className="glass-panel p-6 md:p-8 relative overflow-hidden bg-slate-950/40 border-white/5 shadow-2xl">
      <div className="space-y-0.5">
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
          Coming up
        </span>
        <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
          Today&apos;s weather timeline
        </h3>
      </div>

      {/* Horizontal Scroll Timeline */}
      <div className="flex gap-4 overflow-x-auto py-5 mt-5 select-none scrollbar-thin scrollbar-thumb-white/10 scroll-smooth">
        {hourlyData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={animationsEnabled ? { opacity: 0, scale: 0.9, y: 10 } : false}
            animate={animationsEnabled ? { opacity: 1, scale: 1, y: 0 } : false}
            transition={{ duration: 0.3, delay: idx * 0.015 }}
            className="flex flex-col items-center justify-between text-center min-w-[76px] bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer shrink-0 hover:scale-105"
          >
            <span className="text-[10px] font-bold text-text-muted tracking-tight">{item.label}</span>

            <div className="my-3 drop-shadow-[0_0_8px_rgba(99,102,241,0.15)]">
              <AnimatedWeatherIcon code={conditionCode} size={24} />
            </div>

            <span className="font-display text-xs font-extrabold text-text-primary">
              {convertTemp(item.temp)}°
            </span>

            {item.rain > 0 ? (
              <div className="flex items-center gap-0.5 mt-2 text-[9px] font-bold text-accent uppercase tracking-wider">
                <Droplet size={8} />
                <span>{item.rain}%</span>
              </div>
            ) : (
              <div className="h-3.5 mt-2" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
