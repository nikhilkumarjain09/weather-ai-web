"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { Thermometer } from "lucide-react";

export default function UnitToggle() {
  const { unit, toggleUnit, showToast } = useAppStore();

  const handleToggle = () => {
    toggleUnit();
    showToast(`Metric units swapped to °${unit === "C" ? "F" : "C"}`, "info");
  };

  return (
    <div className="flex items-center gap-2 font-sans">
      <div className="flex bg-surface-raised p-0.5 rounded border border-border">
        <button
          onClick={handleToggle}
          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
            unit === "C" ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
          }`}
        >
          °C
        </button>
        <button
          onClick={handleToggle}
          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
            unit === "F" ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
          }`}
        >
          °F
        </button>
      </div>
    </div>
  );
}
