"use client";

import React from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplet,
} from "lucide-react";
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

  const iconMap: Record<string, React.ComponentType<any>> = {
    sunny: Sun,
    cloudy: CloudSun,
    rainy: CloudRain,
    windy: Sun,
    snowy: CloudSnow,
    stormy: CloudLightning,
  };

  const IconComponent = iconMap[conditionCode] || Cloud;

  // Generate 24 hours starting from current hour
  const currentHour = new Date().getHours();
  const hourlyData = Array.from({ length: 24 }).map((_, i) => {
    const hourVal = (currentHour + i) % 24;
    const ampm = hourVal >= 12 ? "PM" : "AM";
    const displayHour = hourVal % 12 === 0 ? 12 : hourVal % 12;
    const label = i === 0 ? "Now" : `${displayHour} ${ampm}`;

    // Temperature simulation using a diurnal sine wave
    // cold at 6am (rad = -pi/2), hot at 4pm (rad = pi/2)
    const rad = ((hourVal - 10) / 24) * 2 * Math.PI;
    const tempOffset = (Math.sin(rad) + 1) / 2; // value between 0 and 1
    const rawTemp = minTemp + (maxTemp - minTemp) * tempOffset;
    
    // Blend the actual current conditions temp into the first index
    const temp = i === 0 ? currentTemp : Math.round(rawTemp);

    // Simulated rain probability variation
    const rainOffset = Math.sin((hourVal / 24) * Math.PI) * 15;
    const rain = Math.max(0, Math.min(100, Math.round(precipChance + rainOffset)));

    // Simulated wind variation
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
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <div>
        <h3 className="font-display text-base font-bold text-text-primary">Hourly Forecast</h3>
        <p className="text-xs text-text-muted mt-0.5">
          Diurnal timeline representing hourly conditions over the next 24 hours.
        </p>
      </div>

      {/* Horizontal Scroll Timeline */}
      <div className="flex gap-4 overflow-x-auto py-4 mt-4 select-none scrollbar-thin scrollbar-thumb-border scroll-smooth">
        {hourlyData.map((item, idx) => (
          <motion.div
            key={idx}
            initial={animationsEnabled ? { opacity: 0, x: 20 } : false}
            animate={animationsEnabled ? { opacity: 1, x: 0 } : false}
            transition={{ duration: 0.3, delay: idx * 0.02 }}
            className="flex flex-col items-center justify-between text-center min-w-[70px] bg-surface-raised border border-border rounded-lg p-3 hover:border-accent/30 transition-all cursor-pointer shrink-0"
          >
            <span className="text-[10px] font-semibold text-text-muted">{item.label}</span>

            <div className="my-2.5 text-accent">
              <IconComponent size={16} />
            </div>

            <span className="font-mono text-sm font-extrabold text-text-primary">
              {convertTemp(item.temp)}°
            </span>

            {item.rain > 0 ? (
              <div className="flex items-center gap-0.5 mt-2 text-[9px] font-bold text-accent">
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
