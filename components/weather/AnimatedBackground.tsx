"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useTheme } from "next-themes";

interface AnimatedBackgroundProps {
  conditionCode: string;
  isDay?: number;
}

interface GradientTheme {
  classes: string;
  glowColor: string;
}

export default function AnimatedBackground({ conditionCode, isDay = 1 }: AnimatedBackgroundProps) {
  const { animationsEnabled } = usePreferencesStore();
  const { resolvedTheme } = useTheme();
  const [lightning, setLightning] = useState(false);
  const [lightningStrikePos, setLightningStrikePos] = useState(50);

  const code = conditionCode.toLowerCase();
  const resolvedIsNight = isDay === 0 || code === "night";

  const isRain = code === "rainy" || code === "stormy";
  const isSnow = code === "snowy";
  const isCloud = code === "cloudy";
  const isSun = code === "sunny";
  const isWind = code === "windy";

  // Periodic lightning flashes for stormy weather in dark mode
  useEffect(() => {
    if (code !== "stormy" || !animationsEnabled || resolvedTheme === "light" || resolvedIsNight) return;
    
    const interval = setInterval(() => {
      setLightningStrikePos(Math.random() * 80 + 10);
      setLightning(true);
      const timer = setTimeout(() => setLightning(false), 250);
      return () => clearTimeout(timer);
    }, 5000 + Math.random() * 6000);

    return () => clearInterval(interval);
  }, [code, animationsEnabled, resolvedTheme, resolvedIsNight]);

  if (!animationsEnabled) return null;

  // Dynamic premium background gradients
  let theme: GradientTheme = {
    classes: "from-[#080b18] via-[#0c102b] to-[#04060f]",
    glowColor: "rgba(99, 102, 241, 0.08)",
  };

  if (resolvedIsNight) {
    // Starry night sky colors
    theme = {
      classes: "from-[#02040b] via-[#050c18] to-[#010204]",
      glowColor: "rgba(99, 102, 241, 0.04)",
    };
  } else if (resolvedTheme === "light") {
    // Bright, elegant light-mode day colors
    if (isSun) {
      theme = {
        classes: "from-[#e0f2fe] via-[#fef3c7] to-[#dbeafe]",
        glowColor: "rgba(245, 158, 11, 0.35)",
      };
    } else if (isRain) {
      theme = {
        classes: "from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]",
        glowColor: "rgba(56, 189, 248, 0.25)",
      };
    } else if (isSnow) {
      theme = {
        classes: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
        glowColor: "rgba(203, 213, 225, 0.2)",
      };
    } else if (isCloud) {
      theme = {
        classes: "from-[#f8fafc] via-[#f1f5f9] to-[#cbd5e1]",
        glowColor: "rgba(148, 163, 184, 0.2)",
      };
    } else {
      theme = {
        classes: "from-[#e0f2fe] via-[#f1f5f9] to-[#e2e8f0]",
        glowColor: "rgba(45, 212, 191, 0.25)",
      };
    }
  } else {
    // Sleek dark-mode day colors
    if (isSun) {
      theme = {
        classes: "from-[#0c1a30] via-[#112446] to-[#081226]",
        glowColor: "rgba(245, 158, 11, 0.12)",
      };
    } else if (isRain) {
      theme = {
        classes: "from-[#0a0f1d] via-[#131a35] to-[#070b14]",
        glowColor: "rgba(56, 189, 248, 0.08)",
      };
    } else if (isSnow) {
      theme = {
        classes: "from-[#111827] via-[#1f2937] to-[#0f172a]",
        glowColor: "rgba(255, 255, 255, 0.06)",
      };
    } else if (isCloud) {
      theme = {
        classes: "from-[#0b0f19] via-[#161f38] to-[#0a0d16]",
        glowColor: "rgba(148, 163, 184, 0.06)",
      };
    } else if (isWind) {
      theme = {
        classes: "from-[#09152b] via-[#122548] to-[#060e1d]",
        glowColor: "rgba(45, 212, 191, 0.08)",
      };
    }
  }

  // Push style variables directly to body for seamless blend
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (lightning) {
      root.style.setProperty("--bg", resolvedTheme === "light" ? "#f1f5f9" : "#2e2059");
    } else {
      if (resolvedIsNight) {
        root.style.setProperty("--bg", "#02040b");
      } else if (resolvedTheme === "light") {
        root.style.setProperty("--bg", isSun ? "#fef3c7" : isRain ? "#e2e8f0" : "#f8fafc");
      } else {
        root.style.setProperty("--bg", isSun ? "#071022" : isRain ? "#070b14" : "#030712");
      }
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 transition-all duration-1000">
      {/* 1. Base Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.classes} transition-all duration-1000`} />

      {/* 2. Twinkling Stars Overlay for Night */}
      {resolvedIsNight && (
        <div className="absolute inset-0 z-0 opacity-40">
          {Array.from({ length: 45 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${(i * 1.3 + Math.random() * 5) % 65}%`,
                left: `${(i * 2.2 + Math.random() * 8) % 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${1.5 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Glow Blobs */}
      <div
        className="absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full filter blur-[120px] animate-pulse-glow"
        style={{ backgroundColor: theme.glowColor }}
      />

      {/* 4. Sunlight / Sunbeam rays */}
      {isSun && !resolvedIsNight && (
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="w-full h-full opacity-[0.06] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)]"
          />
        </div>
      )}

      {/* 5. Stormy lightning overlay and bolts */}
      <AnimatePresence>
        {lightning && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: resolvedTheme === "light" ? 0.1 : 0.22 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white dark:bg-purple-100 z-10"
            />
            <svg
              className="absolute inset-y-0 w-32 h-full z-10 opacity-75"
              style={{ left: `${lightningStrikePos}%` }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path
                d="M 50 0 L 40 35 L 60 30 L 35 65 L 55 60 L 50 100"
                stroke={resolvedTheme === "light" ? "#f59e0b" : "#a855f7"}
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
              />
            </svg>
          </>
        )}
      </AnimatePresence>

      {/* 6. Animated Raindrops */}
      {isRain && (
        <div className="absolute inset-0 flex justify-between px-8 opacity-40">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "-120%" }}
              animate={{ y: "100vh" }}
              transition={{
                duration: 0.7 + Math.random() * 0.5,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 1.5,
              }}
              className="w-[1.2px] h-12 bg-sky-400 dark:bg-sky-500 rounded-full shrink-0"
              style={{
                opacity: 0.4 + Math.random() * 0.6,
                marginLeft: `${Math.random() * 20}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* 7. Falling Snowflakes */}
      {isSnow && (
        <div className="absolute inset-0 flex justify-around opacity-60">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 40 - 20, rotate: 0 }}
              animate={{
                y: "100vh",
                x: [Math.random() * 40 - 20, Math.random() * 60 - 30, Math.random() * 40 - 20],
                rotate: 360,
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
              className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-100 rounded-full shrink-0"
              style={{
                opacity: 0.5 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* 8. Realistic Puffy Floating Clouds Layer */}
      <div className="absolute inset-0">
        {Array.from({ length: 6 }).map((_, i) => {
          const sizeWidth = 250 + (i % 3) * 100;
          const sizeHeight = 70 + (i % 2) * 40;
          const duration = 60 + i * 25;
          
          let cloudClass = "bg-white/40 border-white/10 dark:bg-slate-900/30 dark:border-white/5";
          if (isRain || code === "stormy") {
            cloudClass = "bg-slate-300/30 dark:bg-slate-950/40 border-slate-400/10 dark:border-white/5";
          }
          
          return (
            <motion.div
              key={i}
              initial={{ x: "-100%", y: `${10 + i * 14}%` }}
              animate={{ x: "100vw" }}
              transition={{
                duration,
                repeat: Infinity,
                ease: "linear",
                delay: i * -15,
              }}
              className={`absolute rounded-full filter blur-[50px] dark:blur-[60px] border ${cloudClass}`}
              style={{
                width: `${sizeWidth}px`,
                height: `${sizeHeight}px`,
                opacity: resolvedTheme === "light" ? 0.65 : 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
