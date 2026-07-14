"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferencesStore } from "@/store/preferencesStore";

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateStars(count: number, width: number, height: number, seedOffset: number) {
  let shadowString = "";
  for (let i = 0; i < count; i++) {
    const x = Math.floor(pseudoRandom(i * 13 + seedOffset) * width);
    const y = Math.floor(pseudoRandom(i * 29 + seedOffset + 7) * height);
    const opacity = (0.15 + pseudoRandom(i * 41 + seedOffset + 13) * 0.85).toFixed(2);
    shadowString += `${x}px ${y}px rgba(255, 255, 255, ${opacity})`;
    if (i < count - 1) shadowString += ", ";
  }
  return shadowString;
}

interface AnimatedBackgroundProps {
  conditionCode: string;
  isDay?: number;
}

interface GradientTheme {
  classes: string;
  glowColor: string;
}

export default function AnimatedBackground({ conditionCode, isDay = 1 }: AnimatedBackgroundProps) {
  const { theme, animationsEnabled } = usePreferencesStore();
  const [isDark, setIsDark] = useState(false);
  const [lightning, setLightning] = useState(false);
  const [lightningStrikePos, setLightningStrikePos] = useState(50);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeIsMobile = mounted && isMobile;

  const code = conditionCode.toLowerCase();
  const resolvedIsNight = Number(isDay) === 0 || code === "night";
  const showSpaceView = resolvedIsNight;

  const starW = activeIsMobile ? 600 : 2400;
  const starH = activeIsMobile ? 1000 : 2400;

  const stars1 = React.useMemo(() => generateStars(activeIsMobile ? 60 : 500, starW, starH, 100), [activeIsMobile, starW, starH]);
  const stars2 = React.useMemo(() => generateStars(activeIsMobile ? 40 : 350, starW, starH, 200), [activeIsMobile, starW, starH]);
  const stars3 = React.useMemo(() => generateStars(activeIsMobile ? 20 : 150, starW, starH, 300), [activeIsMobile, starW, starH]);

  const isRain = code === "rainy" || code === "stormy";
  const isSnow = code === "snowy";
  const isCloud = code === "cloudy";
  const isSun = code === "sunny";

  useEffect(() => {
    const checkDark = () => {
      const darkTheme = theme === "dark" || 
        (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(darkTheme);
    };
    checkDark();
    
    if (theme === "system" && typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => checkDark();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  // Periodic lightning flashes for stormy weather in dark mode
  useEffect(() => {
    if (code !== "stormy" || !animationsEnabled || !isDark || resolvedIsNight) return;
    
    const interval = setInterval(() => {
      setLightningStrikePos(Math.random() * 80 + 10);
      setLightning(true);
      const timer = setTimeout(() => setLightning(false), 250);
      return () => clearTimeout(timer);
    }, 5000 + Math.random() * 6000);

    return () => clearInterval(interval);
  }, [code, animationsEnabled, isDark, resolvedIsNight]);

  if (!animationsEnabled) return null;

  // Dynamic premium background gradients
  let bgTheme: GradientTheme = {
    classes: "from-[#080b18] via-[#0c102b] to-[#04060f]",
    glowColor: "rgba(99, 102, 241, 0.08)",
  };

  if (resolvedIsNight) {
    // Starry night sky/space colors
    bgTheme = {
      classes: "from-[#02040b] via-[#050c18] to-[#010204]",
      glowColor: "rgba(99, 102, 241, 0.04)",
    };
  } else if (isDark) {
    // Sleek dark-mode day colors
    bgTheme = {
      classes: "from-[#0b0f19] via-[#161f38] to-[#0a0d16]",
      glowColor: "rgba(99, 102, 241, 0.08)",
    };
  } else {
    // Bright, elegant light-mode day colors
    if (isSun) {
      bgTheme = {
        classes: "from-[#e0f2fe] via-[#fef3c7] to-[#dbeafe]",
        glowColor: "rgba(245, 158, 11, 0.35)",
      };
    } else if (isRain) {
      bgTheme = {
        classes: "from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]",
        glowColor: "rgba(56, 189, 248, 0.25)",
      };
    } else if (isSnow) {
      bgTheme = {
        classes: "from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]",
        glowColor: "rgba(203, 213, 225, 0.2)",
      };
    } else if (isCloud) {
      bgTheme = {
        classes: "from-[#f8fafc] via-[#f1f5f9] to-[#cbd5e1]",
        glowColor: "rgba(148, 163, 184, 0.2)",
      };
    } else {
      bgTheme = {
        classes: "from-[#e0f2fe] via-[#f1f5f9] to-[#e2e8f0]",
        glowColor: "rgba(45, 212, 191, 0.25)",
      };
    }
  }

  // Push style variables directly to body for seamless blend
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (lightning) {
      root.style.setProperty("--bg", !isDark ? "#f1f5f9" : "#2e2059");
    } else {
      if (resolvedIsNight) {
        root.style.setProperty("--bg", "#02040b");
      } else if (isDark) {
        root.style.setProperty("--bg", "#0a0d16");
      } else {
        root.style.setProperty("--bg", isSun ? "#fef3c7" : isRain ? "#e2e8f0" : "#f8fafc");
      }
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 transition-all duration-1000">
      {/* 1. Base Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${bgTheme.classes} transition-all duration-1000`} />

      {/* 2. Twinkling Stars & Space View for Night */}
      {showSpaceView && (
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          {/* Nebula dust (completely disabled on mobile to prevent GPU blur OOM) */}
          {!activeIsMobile && (
            <>
              <div className="absolute top-[10%] left-[15%] w-96 h-96 rounded-full bg-purple-900/10 filter blur-[100px] animate-pulse-glow" />
              <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] rounded-full bg-indigo-900/10 filter blur-[120px]" />
              <div className="absolute top-[40%] right-[25%] w-80 h-80 rounded-full bg-teal-950/10 filter blur-[90px]" />
            </>
          )}

          {/* Parallax Starfield Layers (scaled down and static translation on mobile to save GPU memory) */}
          <motion.div
            className="absolute rounded-full bg-transparent"
            style={{
              width: "1px",
              height: "1px",
              boxShadow: stars1,
              top: 0,
              left: 0,
            }}
            animate={activeIsMobile ? {
              opacity: [0.7, 1, 0.7],
            } : {
              x: [0, -35, 25, 0],
              y: [0, 25, -35, 0],
              opacity: [0.7, 1, 0.7],
            }}
            transition={activeIsMobile ? {
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            } : {
              duration: 90,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute rounded-full bg-transparent"
            style={{
              width: "1.5px",
              height: "1.5px",
              boxShadow: stars2,
              top: 0,
              left: 0,
            }}
            animate={activeIsMobile ? {
              opacity: [0.8, 0.5, 0.8],
            } : {
              x: [0, 20, -30, 0],
              y: [0, -30, 20, 0],
              opacity: [0.8, 0.5, 0.8],
            }}
            transition={activeIsMobile ? {
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            } : {
              duration: 120,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute rounded-full bg-transparent"
            style={{
              width: "2.2px",
              height: "2.2px",
              boxShadow: stars3,
              top: 0,
              left: 0,
            }}
            animate={activeIsMobile ? {
              opacity: [0.6, 0.9, 0.6],
            } : {
              x: [0, -45, 35, 0],
              y: [0, -25, 45, 0],
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={activeIsMobile ? {
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            } : {
              duration: 150,
              repeat: Infinity,
              ease: "linear",
            }}
          />

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

          {/* Bottom-Left Galaxy (Andromeda style) */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] left-[6%] pointer-events-none select-none"
          >
            <svg viewBox="0 0 160 100" className="w-56 h-36 text-indigo-400 opacity-20 hover:opacity-35 transition-opacity duration-500">
              <ellipse cx="80" cy="50" rx="14" ry="8" fill="white" className="blur-[4px]" />
              <ellipse cx="80" cy="50" rx="30" ry="15" fill="var(--color-accent)" className="opacity-30 blur-[8px]" />
              <path d="M 80 50 Q 110 30 130 50 T 150 70" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 6" className="opacity-70" />
              <path d="M 80 50 Q 50 70 30 50 T 10 30" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="3 6" className="opacity-70" />
              <path d="M 80 50 Q 100 70 120 60 T 140 40" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 4" className="opacity-50" />
              <path d="M 80 50 Q 60 30 40 40 T 20 60" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="2 4" className="opacity-50" />
            </svg>
          </motion.div>

          {/* Bottom-Right Galaxy (Pinwheel style) */}
          <motion.div
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[8%] right-[8%] pointer-events-none select-none"
          >
            <svg viewBox="0 0 120 120" className="w-44 h-44 text-teal-400 opacity-15 hover:opacity-30 transition-opacity duration-500">
              <circle cx="60" cy="60" r="10" fill="white" className="blur-[3px]" />
              <circle cx="60" cy="60" r="25" fill="#2dd4bf" className="opacity-25 blur-[6px]" />
              <path d="M 60 60 C 80 40, 90 70, 100 80" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="opacity-65" />
              <path d="M 60 60 C 40 80, 30 50, 20 40" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="opacity-65" />
              <path d="M 60 60 C 80 80, 50 90, 40 100" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="opacity-65" />
              <path d="M 60 60 C 40 40, 70 30, 80 20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeDasharray="4 4" className="opacity-65" />
            </svg>
          </motion.div>

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
      {!showSpaceView && (
        <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
          {Array.from({ length: activeIsMobile ? 6 : 22 }).map((_, i) => {
            const seedWidth = i * 23 + 17;
            const seedSpeed = i * 37 + 13;
            const seedHeight = i * 43 + 19;
            const seedDelay = i * 59 + 29;

            const size = 80 + Math.floor(pseudoRandom(seedWidth) * 140); // 80 to 220px width
            const duration = 40 + Math.floor(pseudoRandom(seedSpeed) * 80); // 40s to 120s speed
            const yOffset = 15 + Math.floor(pseudoRandom(seedHeight) * 60); // spread 15% to 75% (middle)
            const delay = pseudoRandom(seedDelay) * -120; // negative delay to pre-distribute

            const styleIndex = i % 3;
            let pathD = "M 20 40 A 15 15 0 0 1 45 25 A 22 22 0 0 1 85 30 A 15 15 0 0 1 95 45 A 12 12 0 0 1 85 55 L 20 55 A 12 12 0 0 1 20 40 Z"; // Style A (Standard)
            if (styleIndex === 1) {
              pathD = "M 10 35 A 8 8 0 0 1 25 28 A 12 12 0 0 1 65 24 A 18 18 0 0 1 90 32 A 8 8 0 0 1 95 40 L 10 40 Z"; // Style B (Wispy / Flat)
            } else if (styleIndex === 2) {
              pathD = "M 15 45 A 12 12 0 0 1 30 30 A 16 16 0 0 1 50 18 A 20 20 0 0 1 80 25 A 12 12 0 0 1 88 45 Z"; // Style C (Tall / Puffy)
            }

            return (
              <motion.div
                key={i}
                initial={{ x: "-250px", y: `${yOffset}%` }}
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
                    d={pathD}
                    fill={isDark ? "rgba(30, 41, 59, 0.55)" : "rgba(255, 255, 255, 0.85)"}
                    stroke={isDark ? "rgba(71, 85, 105, 0.45)" : "rgba(226, 232, 240, 0.95)"}
                    strokeWidth="1.5"
                  />
                </svg>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. Glow Blobs (completely disabled on mobile to prevent GPU blur OOM) */}
      {!activeIsMobile && (
        <div
          className="absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full filter blur-[120px] animate-pulse-glow"
          style={{ backgroundColor: bgTheme.glowColor }}
        />
      )}

      {/* 4. Sunlight / Sunbeam rays */}
      {isSun && !showSpaceView && (
        <div className={`absolute top-0 right-0 ${activeIsMobile ? "w-[300px] h-[300px]" : "w-[600px] h-[600px]"} pointer-events-none`}>
          <motion.div
            animate={animationsEnabled ? { rotate: 360 } : {}}
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
              animate={{ opacity: !isDark ? 0.1 : 0.22 }}
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
                stroke={!isDark ? "#f59e0b" : "#a855f7"}
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
          {Array.from({ length: activeIsMobile ? 12 : 30 }).map((_, i) => (
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
          {Array.from({ length: activeIsMobile ? 15 : 40 }).map((_, i) => (
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

      {/* 8. Realistic Puffy Floating Clouds Layer (completely disabled on mobile to prevent GPU blur OOM) */}
      {!showSpaceView && !activeIsMobile && (
        <div className="absolute inset-0">
          {Array.from({ length: activeIsMobile ? 4 : 18 }).map((_, i) => {
            const seedWidth = i * 19 + 7;
            const seedHeight = i * 31 + 13;
            const seedSpeed = i * 43 + 17;
            const seedY = i * 53 + 23;
            const seedBlur = i * 61 + 29;

            const sizeWidth = activeIsMobile 
              ? 100 + Math.floor(pseudoRandom(seedWidth) * 100) 
              : 200 + Math.floor(pseudoRandom(seedWidth) * 250);
            const sizeHeight = activeIsMobile
              ? 30 + Math.floor(pseudoRandom(seedHeight) * 40)
              : 60 + Math.floor(pseudoRandom(seedHeight) * 80);
            const duration = 50 + Math.floor(pseudoRandom(seedSpeed) * 80);
            const yOffset = 15 + Math.floor(pseudoRandom(seedY) * 60);
            const blurVal = activeIsMobile
              ? 10 + Math.floor(pseudoRandom(seedBlur) * 15)
              : 40 + Math.floor(pseudoRandom(seedBlur) * 45);
            
            let cloudClass = "bg-white/40 border-white/10 dark:bg-slate-900/30 dark:border-white/5";
            if (isRain || code === "stormy") {
              cloudClass = "bg-slate-300/30 dark:bg-slate-950/40 border-slate-400/10 dark:border-white/5";
            }
            
            return (
              <motion.div
                key={i}
                initial={{ x: "-100%", y: `${yOffset}%` }}
                animate={{ x: "100vw" }}
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * -18,
                }}
                className={`absolute rounded-full border ${cloudClass}`}
                style={{
                  width: `${sizeWidth}px`,
                  height: `${sizeHeight}px`,
                  filter: `blur(${blurVal}px)`,
                  opacity: !isDark ? 0.65 : 0.3,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
