"use client";

import React from "react";

interface AnimatedWeatherIconProps {
  code?: string;
  size?: number;
  className?: string;
}

export default function AnimatedWeatherIcon({ code = "", size = 48, className = "" }: AnimatedWeatherIconProps) {
  const normCode = (code || "").toLowerCase();

  const getSvgContent = () => {
    switch (normCode) {
      case "sunny":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size} className="animate-spin-slow">
            <circle cx="32" cy="32" r="12" fill="#f59e0b" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 360) / 8;
              return (
                <line
                  key={i}
                  x1="32"
                  y1="10"
                  x2="32"
                  y2="16"
                  stroke="#f59e0b"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  transform={`rotate(${angle} 32 32)`}
                />
              );
            })}
          </svg>
        );

      case "cloudy":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            {/* Drifting background sun */}
            <circle cx="40" cy="24" r="8" fill="#f59e0b" className="opacity-80" />
            <path
              d="M16 44a8 8 0 0 1 8-8c1.3 0 2.5.3 3.6.9A11.9 11.9 0 0 1 48 38a10 10 0 0 1-6 18H22a10 10 0 0 1-6-12Z"
              fill="#e2e8f0"
              className="drop-shadow-lg"
              style={{
                animation: "drift 4s ease-in-out infinite",
              }}
            />
          </svg>
        );

      case "rainy":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            <path
              d="M20 38a6 6 0 0 1 6-6c1 .2 1.9.6 2.7 1.2A9.9 9.9 0 0 1 46 32a8 8 0 0 1-5 14H25a9 9 0 0 1-5-8Z"
              fill="#94a3b8"
            />
            {/* Animated raindrops */}
            <line
              x1="26"
              y1="46"
              x2="24"
              y2="52"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDuration: "0.8s" }}
            />
            <line
              x1="34"
              y1="46"
              x2="32"
              y2="52"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDuration: "1.1s", animationDelay: "0.2s" }}
            />
            <line
              x1="42"
              y1="46"
              x2="40"
              y2="52"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDuration: "0.9s", animationDelay: "0.4s" }}
            />
          </svg>
        );

      case "snowy":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            <path
              d="M20 38a6 6 0 0 1 6-6c1 .2 1.9.6 2.7 1.2A9.9 9.9 0 0 1 46 32a8 8 0 0 1-5 14H25a9 9 0 0 1-5-8Z"
              fill="#cbd5e1"
            />
            {/* Drifting snowflakes */}
            <circle cx="26" cy="48" r="1.5" fill="#f8fafc" className="animate-bounce" style={{ animationDuration: "1.5s" }} />
            <circle cx="34" cy="50" r="1.5" fill="#f8fafc" className="animate-bounce" style={{ animationDuration: "1.8s", animationDelay: "0.3s" }} />
            <circle cx="42" cy="48" r="1.5" fill="#f8fafc" className="animate-bounce" style={{ animationDuration: "1.4s", animationDelay: "0.6s" }} />
          </svg>
        );

      case "stormy":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            <path
              d="M20 38a6 6 0 0 1 6-6c1 .2 1.9.6 2.7 1.2A9.9 9.9 0 0 1 46 32a8 8 0 0 1-5 14H25a9 9 0 0 1-5-8Z"
              fill="#475569"
            />
            {/* Flashing lightning bolt */}
            <path
              d="M32 44l-4 6h5l-2 6 6-7h-5z"
              fill="#eab308"
              className="animate-pulse"
              style={{ animationDuration: "0.5s" }}
            />
          </svg>
        );

      case "night":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            <path
              d="M44 38.5A16.5 16.5 0 0 1 25.5 20c0-1.8.3-3.6.8-5.3A16.5 16.5 0 1 0 49.3 39c-1.7.5-3.5.8-5.3.8Z"
              fill="#cbd5e1"
              className="drop-shadow-[0_0_8px_rgba(203,213,225,0.4)]"
            />
          </svg>
        );

      case "windy":
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            {/* Parallel wind bands */}
            <path
              d="M16 24h24a4 4 0 0 0 0-8H36 M12 36h36a4 4 0 0 1 0 8H44"
              fill="none"
              stroke="#2dd4bf"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="animate-pulse"
              style={{ animationDuration: "1.2s" }}
            />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 64 64" width={size} height={size}>
            <circle cx="32" cy="32" r="16" fill="#6366f1" />
          </svg>
        );
    }
  };

  return <div className={`inline-block shrink-0 ${className}`}>{getSvgContent()}</div>;
}
