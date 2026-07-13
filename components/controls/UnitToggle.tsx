"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2 } from "lucide-react";

export default function UnitToggle() {
  const { unit, showToast } = useAppStore();
  const [loading, setLoading] = useState(false);

  const handleSelect = (targetUnit: "C" | "F") => {
    if (unit === targetUnit || loading) return;

    setLoading(true);
    // Brief isolated delay to simulate unit transition recalculations
    setTimeout(() => {
      useAppStore.setState({ unit: targetUnit });
      showToast(`System units set to ${targetUnit === "C" ? "Metric (°C)" : "Imperial (°F)"}`, "info");
      setLoading(false);
    }, 250);
  };

  return (
    <div className="flex items-center gap-2 font-sans">
      <div className="flex bg-surface-raised p-0.5 rounded border border-border items-center relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-surface/50 flex items-center justify-center z-10">
            <Loader2 className="animate-spin text-accent" size={12} />
          </div>
        )}
        <button
          onClick={() => handleSelect("C")}
          disabled={loading}
          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all disabled:opacity-50 ${
            unit === "C" ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
          }`}
        >
          METRIC
        </button>
        <button
          onClick={() => handleSelect("F")}
          disabled={loading}
          className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all disabled:opacity-50 ${
            unit === "F" ? "bg-accent-tint text-accent" : "text-text-muted hover:text-text-primary"
          }`}
        >
          IMPERIAL
        </button>
      </div>
    </div>
  );
}
