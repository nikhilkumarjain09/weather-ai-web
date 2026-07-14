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

      {/* 2. Twinkling Stars & Space View for Night */}
      {resolvedIsNight && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Nebula dust */}
          <div className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-purple-900/10 filter blur-[100px] animate-pulse-glow" />
          <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-900/10 filter blur-[120px]" />
          <div className="absolute top-[40%] right-[25%] w-80 h-80 rounded-full bg-teal-950/10 filter blur-[90px]" />

          {/* Twinkling Stars */}
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

          {/* Constellation dashed lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" stroke="white" strokeWidth="0.5" strokeDasharray="2 4">
            <line x1="10%" y1="20%" x2="18%" y2="12%" />
            <line x1="18%" y1="12%" x2="25%" y2="22%" />
            <line x1="25%" y1="22%" x2="30%" y2="15%" />

            <line x1="70%" y1="40%" x2="75%" y2="30%" />
            <line x1="75%" y1="30%" x2="85%" y2="35%" />
          </svg>

          {/* Pinned Planet (Saturn) */}
          <div className="absolute top-[15%] right-[12%] w-20 h-12 opacity-25 hover:opacity-40 transition-opacity">
            <svg viewBox="0 0 100 60" fill="none" className="w-full h-full text-indigo-300">
              <ellipse cx="50" cy="30" rx="35" ry="7" stroke="currentColor" strokeWidth="1.5" transform="rotate(-15 50 30)" className="opacity-60" />
              <circle cx="50" cy="30" r="14" fill="#090d1f" stroke="currentColor" strokeWidth="1.5" />
              <path d="M 16 31.5 A 35 7 0 0 0 84 28.5" stroke="currentColor" strokeWidth="1.5" transform="rotate(-15 50 30)" className="opacity-80" />
            </svg>
          </div>

          {/* Pinned Planet (Mars or distant moon) */}
          <div className="absolute top-[25%] left-[8%] w-10 h-10 opacity-15">
            <svg viewBox="0 0 40 40" fill="none" className="w-full h-full text-rose-400">
              <circle cx="20" cy="20" r="12" fill="#0c0a1a" stroke="currentColor" strokeWidth="1.5" />
              {/* craters */}
              <circle cx="16" cy="16" r="2" fill="currentColor" className="opacity-40" />
              <circle cx="24" cy="22" r="3" fill="currentColor" className="opacity-40" />
            </svg>
          </div>

          {/* Shooting Stars */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "85%", y: "-10%", opacity: 0 }}
              animate={{ x: "-20%", y: "90%", opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 1.5 + Math.random(),
                repeat: Infinity,
                repeatDelay: 10 + Math.random() * 15,
                ease: "easeInOut",
                delay: i * 6,
              }}
              className="absolute w-24 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent transform -rotate-[45deg] origin-left"
            />
          ))}
        </div>
      )}

      {/* 9. Cartoonic Floating Clouds for Day Light Mode */}
      {resolvedTheme === "light" && !resolvedIsNight && (
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          {Array.from({ length: 5 }).map((_, i) => {
            const size = 80 + (i % 3) * 40; // 80 to 160px width
            const duration = 45 + i * 15; // 45s to 105s speed
            const yOffset = 5 + i * 14; // vertical offsets: 5%, 19%, 33%, 47%, 61%
            const delay = i * -12; // negative delay to distribute clouds pre-render

            return (
              <motion.div
                key={i}
                initial={{ x: "-200px", y: `${yOffset}%` }}
                animate={{ x: "100vw" }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay,
                }}
                className="absolute"
                style={{ width: `${size}px` }}
              >
                <svg viewBox="0 0 100 60" fill="none" className="w-full h-full">
                  <path
                    d="M 20 40 A 15 15 0 0 1 45 25 A 22 22 0 0 1 85 30 A 15 15 0 0 1 95 45 A 12 12 0 0 1 85 55 L 20 55 A 12 12 0 0 1 20 40 Z"
                    fill="rgba(255, 255, 255, 0.85)"
                    stroke="rgba(226, 232, 240, 0.95)"
                    strokeWidth="1.5"
                  />
                </svg>
              </motion.div>
            );
          })}
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
