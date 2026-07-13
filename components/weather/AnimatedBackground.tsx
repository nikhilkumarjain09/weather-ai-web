"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreferencesStore } from "@/store/preferencesStore";

interface AnimatedBackgroundProps {
  conditionCode: string;
}

interface GradientTheme {
  classes: string;
  glowColor: string;
}

export default function AnimatedBackground({ conditionCode }: AnimatedBackgroundProps) {
  const { animationsEnabled } = usePreferencesStore();
  const [lightning, setLightning] = useState(false);

  // Periodic lightning flashes for stormy weather
  useEffect(() => {
    if (conditionCode !== "stormy" || !animationsEnabled) return;
    const interval = setInterval(() => {
      setLightning(true);
      const timer = setTimeout(() => setLightning(false), 200);
      return () => clearTimeout(timer);
    }, 6000 + Math.random() * 5000);

    return () => clearInterval(interval);
  }, [conditionCode, animationsEnabled]);

  if (!animationsEnabled) return null;

  const code = conditionCode.toLowerCase();
  const isRain = code === "rainy" || code === "stormy";
  const isSnow = code === "snowy";
  const isCloud = code === "cloudy";
  const isSun = code === "sunny";
  const isWind = code === "windy";
  const isNight = code === "night";

  // Dynamic premium background gradients
  let theme: GradientTheme = {
    classes: "from-[#080b18] via-[#0c102b] to-[#04060f]",
    glowColor: "rgba(99, 102, 241, 0.08)",
  };

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
  } else if (isNight) {
    theme = {
      classes: "from-[#02040a] via-[#050b14] to-[#010205]",
      glowColor: "rgba(99, 102, 241, 0.05)",
    };
  }

  // Push style variables directly to body for seamless blend
  if (typeof document !== "undefined") {
    const root = document.documentElement;
    if (lightning) {
      root.style.setProperty("--bg", "#2e2059");
    } else {
      root.style.setProperty("--bg", isSun ? "#071022" : isRain ? "#070b14" : "#030712");
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-20 transition-all duration-1000">
      {/* 1. Base Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.classes} transition-all duration-1000`} />

      {/* 2. Glow Blobs */}
      <div
        className="absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full filter blur-[120px] animate-pulse-glow"
        style={{ backgroundColor: theme.glowColor }}
      />

      {/* 3. Sunlight / Sunbeam rays */}
      {isSun && (
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="w-full h-full opacity-[0.06] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_70%)]"
          />
        </div>
      )}

      {/* 4. Stormy lightning overlay */}
      <AnimatePresence>
        {lightning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-10"
          />
        )}
      </AnimatePresence>

      {/* 5. Animated Raindrops */}
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
              className="w-[1.2px] h-12 bg-sky-400 rounded-full shrink-0"
              style={{
                opacity: 0.4 + Math.random() * 0.6,
                marginLeft: `${Math.random() * 20}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* 6. Falling Snowflakes */}
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
              className="w-1.5 h-1.5 bg-slate-100 rounded-full shrink-0"
              style={{
                opacity: 0.5 + Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* 7. Mist / Fog drifting particles */}
      {(code === "fog" || code === "cloudy") && (
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "-100%", y: `${15 + i * 18}%` }}
              animate={{ x: "100vw" }}
              transition={{
                duration: 50 + i * 20,
                repeat: Infinity,
                ease: "linear",
                delay: i * -12,
              }}
              className="absolute w-[350px] h-[100px] bg-slate-400/20 rounded-full filter blur-[60px]"
            />
          ))}
        </div>
      )}
    </div>
  );
}
