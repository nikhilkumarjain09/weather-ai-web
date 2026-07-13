"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePreferencesStore } from "@/store/preferencesStore";

interface AnimatedBackgroundProps {
  conditionCode: string;
}

export default function AnimatedBackground({ conditionCode }: AnimatedBackgroundProps) {
  const { animationsEnabled } = usePreferencesStore();

  if (!animationsEnabled) return null;

  const isRain = conditionCode === "rainy" || conditionCode === "stormy";
  const isSnow = conditionCode === "snowy";
  const isCloud = conditionCode === "cloudy";
  const isSun = conditionCode === "sunny" || conditionCode === "windy";

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-[0.08] dark:opacity-[0.04]">
      {/* 1. Falling Rain Overlay */}
      {isRain && (
        <div className="absolute inset-0 flex justify-between px-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "-100%" }}
              animate={{ y: "100vh" }}
              transition={{
                duration: 0.8 + Math.random() * 0.7,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 2,
              }}
              className="w-[1.5px] h-10 bg-accent rounded-full shrink-0"
              style={{
                opacity: 0.3 + Math.random() * 0.7,
                marginLeft: `${Math.random() * 10}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Swirling Snowflakes */}
      {isSnow && (
        <div className="absolute inset-0 flex justify-around">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 40 - 20, rotate: 0 }}
              animate={{
                y: "100vh",
                x: [Math.random() * 40 - 20, Math.random() * 60 - 30, Math.random() * 40 - 20],
                rotate: 360,
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 4,
              }}
              className="w-2 h-2 bg-text-primary rounded-full shrink-0"
              style={{
                opacity: 0.4 + Math.random() * 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* 3. Drifting Clouds */}
      {isCloud && (
        <div className="absolute inset-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "-100%", y: `${10 + i * 20}%` }}
              animate={{ x: "100vw" }}
              transition={{
                duration: 60 + i * 15,
                repeat: Infinity,
                ease: "linear",
                delay: i * -15,
              }}
              className="absolute w-48 h-12 bg-text-muted/20 rounded-full filter blur-xl shrink-0"
            />
          ))}
        </div>
      )}

      {/* 4. Pulsing Sunbeams */}
      {isSun && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-accent filter blur-3xl"
        />
      )}
    </div>
  );
}
