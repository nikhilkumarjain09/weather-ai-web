"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePreferencesStore } from "@/store/preferencesStore";
import AnimatedWeatherIcon from "@/components/shared/AnimatedWeatherIcon";
import { Droplet, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface HourlyTimelineProps {
  currentTemp?: number;
  minTemp?: number;
  maxTemp?: number;
  conditionCode?: string;
  precipChance?: number;
  loading?: boolean;
}

export default function HourlyTimeline({
  currentTemp,
  minTemp,
  maxTemp,
  conditionCode,
  precipChance,
  loading,
}: HourlyTimelineProps) {
  const { unit, animationsEnabled } = usePreferencesStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 10);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const timer = setTimeout(updateScrollState, 500);
    window.addEventListener("resize", updateScrollState);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [loading]);

  const startScrolling = (direction: "left" | "right") => {
    stopScrolling();
    const container = scrollRef.current;
    if (!container) return;

    const step = direction === "left" ? -6 : 6;
    
    // Smooth continuous scroll interval
    scrollIntervalRef.current = setInterval(() => {
      container.scrollLeft += step;
      updateScrollState();
    }, 12);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handleScrollClick = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
      setTimeout(updateScrollState, 350);
    }
  };

  if (loading) {
    return (
      <div className="glass-panel p-6 md:p-8 relative overflow-hidden bg-white/40 dark:bg-slate-950/40 border-slate-200/50 dark:border-white/5 shadow-2xl">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
            Coming up
          </span>
          <div className="h-5 w-48 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
        </div>

        {/* Horizontal Scroll Timeline Skeleton */}
        <div className="flex gap-4 overflow-x-auto py-5 mt-5 scrollbar-thin">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-between text-center min-w-[96px] bg-surface-raised border border-border rounded-2xl p-4 shrink-0"
            >
              <div className="h-3 w-12 bg-surface animate-pulse rounded" />
              <div className="w-7 h-7 rounded-full bg-surface animate-pulse my-3" />
              <div className="h-4 w-10 bg-surface animate-pulse rounded" />
              <div className="h-3 w-14 bg-surface animate-pulse rounded mt-2" />
              <div className="h-3 w-12 bg-surface animate-pulse rounded mt-1.5" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const curTemp = currentTemp ?? 20;
  const mnTemp = minTemp ?? 15;
  const mxTemp = maxTemp ?? 25;
  const condCode = conditionCode ?? "sunny";
  const pChance = precipChance ?? 0;

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
    const rawTemp = mnTemp + (mxTemp - mnTemp) * tempOffset;
    const temp = i === 0 ? curTemp : Math.round(rawTemp);

    const rainOffset = Math.sin((hourVal / 24) * Math.PI) * 15;
    const rain = Math.max(0, Math.min(100, Math.round(pChance + rainOffset)));

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
    <div className="glass-panel p-6 md:p-8 relative overflow-hidden bg-white/40 dark:bg-slate-950/40 border-slate-200/50 dark:border-white/5 shadow-2xl">
      <div className="space-y-0.5">
        <span className="text-[10px] font-bold text-accent uppercase tracking-widest block font-display">
          Coming up
        </span>
        <h3 className="font-display text-base font-bold text-text-primary tracking-tight">
          Today&apos;s weather timeline
        </h3>
      </div>

      {/* Horizontal Scroll Timeline Wrapper */}
      <div className="relative group/timeline mt-5">
        {/* Left Blur Mask & Navigation Button */}
        {showLeftBtn && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/10 dark:from-slate-950/10 to-transparent backdrop-blur-[2px] pointer-events-none z-10 transition-all duration-300" />
            <button
              onMouseDown={() => startScrolling("left")}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              onTouchStart={() => startScrolling("left")}
              onTouchEnd={stopScrolling}
              onClick={() => handleScrollClick("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-raised border border-border shadow-lg flex items-center justify-center text-text-primary z-20 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none opacity-0 group-hover/timeline:opacity-100 focus:opacity-100"
              aria-label="Scroll Left"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        )}

        {/* Right Blur Mask & Navigation Button */}
        {showRightBtn && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/10 dark:from-slate-950/10 to-transparent backdrop-blur-[2px] pointer-events-none z-10 transition-all duration-300" />
            <button
              onMouseDown={() => startScrolling("right")}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              onTouchStart={() => startScrolling("right")}
              onTouchEnd={stopScrolling}
              onClick={() => handleScrollClick("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-surface-raised border border-border shadow-lg flex items-center justify-center text-text-primary z-20 hover:scale-110 active:scale-95 transition-all cursor-pointer select-none opacity-0 group-hover/timeline:opacity-100 focus:opacity-100"
              aria-label="Scroll Right"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Horizontal Scroll Timeline with padding gutters to prevent hover scale clipping */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto py-5 px-5 select-none scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
        >
          {hourlyData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={animationsEnabled ? { opacity: 0, scale: 0.9, y: 10 } : false}
              animate={animationsEnabled ? { opacity: 1, scale: 1, y: 0 } : false}
              transition={{ duration: 0.3, delay: idx * 0.015 }}
              className="flex flex-col items-center justify-between text-center min-w-[96px] bg-surface-raised border border-border rounded-2xl p-4 hover:border-accent/40 transition-all duration-300 cursor-pointer shrink-0 hover:scale-105 shadow-sm"
            >
              <span className="text-[11px] font-extrabold text-text-primary tracking-tight">{item.label}</span>

              <div className="my-2.5 drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]">
                <AnimatedWeatherIcon code={condCode} size={28} />
              </div>

              <span className="font-display text-sm font-extrabold text-text-primary leading-none">
                {convertTemp(item.temp)}°
              </span>

              {item.rain > 0 ? (
                <div className="flex items-center gap-0.5 mt-2 text-[9px] font-extrabold text-sky-500 dark:text-sky-400 uppercase tracking-wider">
                  <Droplet size={9} className="text-sky-500 dark:text-sky-400" />
                  <span>{item.rain}% Rain</span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 mt-2 text-[9px] font-bold text-text-muted/50 uppercase tracking-wider">
                  <span>0% Rain</span>
                </div>
              )}

              <div className="mt-2 text-[9px] font-bold text-text-muted flex items-center gap-1">
                <span className="opacity-80">💨</span>
                <span>{item.wind} km/h</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
