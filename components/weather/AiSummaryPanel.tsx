"use client";

import React, { useState } from "react";
import { Bot, RefreshCw, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface AiSummaryPanelProps {
  lat: number;
  lon: number;
  locationName: string;
}

export default function AiSummaryPanel({ lat, lon, locationName }: AiSummaryPanelProps) {
  const { showToast } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}&ai=true`
      );
      
      const json = await res.json();
      
      if (json.error) {
        throw new Error(json.error.message || `Synthesis Error: ${json.error.code}`);
      }

      if (json.aiSummary) {
        setSummary(json.aiSummary);
        showToast("AI Insights generated successfully", "success");
      } else {
        throw new Error("No AI summary returned from weather provider.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to query AI engine.");
      showToast("Failed to compile AI insights", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && !summary && !loading) {
      fetchAiSummary();
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans transition-all hover:border-accent/30">
      {/* Header Button (Trigger Collapse/Expand) */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-left focus:outline-none group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-raised border border-border text-accent shrink-0">
            <Bot size={18} className={loading ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="font-display text-sm md:text-base font-bold text-text-primary group-hover:text-accent transition-colors">
              WeatherAI Insights for {locationName}
            </h3>
            {!isExpanded && (
              <p className="text-[11px] text-text-muted mt-0.5 font-medium">
                Click to expand and generate real-time AI weather reports.
              </p>
            )}
          </div>
        </div>
        <div className="text-text-muted group-hover:text-text-primary transition-colors pl-2">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Panel Details */}
      {isExpanded && (
        <div className="mt-5 border-t border-border pt-5 animate-slide-in">
          {loading ? (
            <div className="space-y-3 py-2 animate-pulse">
              <div className="h-3 bg-surface-raised border border-border rounded-full w-full"></div>
              <div className="h-3 bg-surface-raised border border-border rounded-full w-5/6"></div>
              <div className="h-3 bg-surface-raised border border-border rounded-full w-4/5"></div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">AI Synthesis Error</p>
                <p className="opacity-80 mt-0.5">{error}</p>
                <button
                  onClick={fetchAiSummary}
                  className="mt-2 text-[10px] font-bold underline uppercase tracking-wider block hover:text-red-400 transition-colors"
                >
                  Retry Synthesis
                </button>
              </div>
            </div>
          ) : summary ? (
            <div className="space-y-4">
              <div className="text-xs text-text-primary leading-relaxed bg-surface-raised/40 border border-border/80 rounded-lg p-3">
                <p className="font-sans font-medium text-text-primary">{summary}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={fetchAiSummary}
                  className="text-[10px] font-bold text-text-muted hover:text-text-primary flex items-center gap-1 uppercase transition-colors"
                >
                  <RefreshCw size={10} />
                  Regenerate
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
