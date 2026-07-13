"use client";

import React, { useState } from "react";
import { Bot, RefreshCw, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface AiSummaryPanelProps {
  lat: number;
  lon: number;
  locationName: string;
}

export default function AiSummaryPanel({ lat, lon, locationName }: AiSummaryPanelProps) {
  const { showToast } = useAppStore();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(locationName)}&ai=true`
      );
      if (!res.ok) {
        throw new Error("API returned status " + res.status);
      }
      const json = await res.json();
      if (json.aiSummary) {
        setSummary(json.aiSummary);
        showToast("AI Summary generated successfully", "success");
      } else {
        throw new Error("No AI summary returned from proxy handler.");
      }
    } catch (e: any) {
      setError(e.message || "Failed to query AI engine.");
      showToast("Failed to compile AI insights", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
          <Bot className="text-accent" size={18} />
          WeatherAI Insights
        </h3>
        {summary && !loading && (
          <button
            onClick={fetchAiSummary}
            className="text-[10px] font-bold text-text-muted hover:text-text-primary flex items-center gap-1 uppercase transition-colors"
          >
            <RefreshCw size={10} />
            Regenerate
          </button>
        )}
      </div>

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
        <div className="text-xs text-text-primary leading-relaxed bg-surface-raised/40 border border-border/80 rounded-lg p-3">
          <p className="font-sans font-medium text-text-primary">{summary}</p>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto leading-relaxed">
            Generate an AI-driven meteorological report analyzing conditions, alerts, and outdoor recommendations for this zone.
          </p>
          <button
            onClick={fetchAiSummary}
            className="px-4 py-2 text-xs font-semibold rounded bg-accent hover:bg-accent/90 text-bg transition-colors"
          >
            Synthesize Summary
          </button>
        </div>
      )}
    </div>
  );
}
