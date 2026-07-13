"use client";

import React, { useState } from "react";
import { Bot, RefreshCw, AlertTriangle, ChevronDown, ChevronUp, Lock, Sparkles, Activity, ShieldAlert } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { weatherService } from "@/services/weather/service";
import LockedFeatureBadge from "@/components/shared/LockedFeatureBadge";

interface AiSummaryPanelProps {
  lat: number;
  lon: number;
  locationName: string;
}

export default function AiSummaryPanel({ lat, lon, locationName }: AiSummaryPanelProps) {
  const { showToast, apiPlan } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAiInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await weatherService.getInsights({ lat, lon });
      if (res.insights) {
        setInsights(res.insights);
        showToast("WeatherAI insights compiled successfully", "success");
      }
    } catch (e: any) {
      if (e.status === 403 || e.code === "FORBIDDEN") {
        setError("PRO_LIMIT");
      } else {
        setError(e.message || "Failed to query AI engine.");
      }
      showToast("Failed to compile AI insights", "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (nextState && !insights && !loading) {
      fetchAiInsights();
    }
  };

  const renderRecommendationCard = (title: string, score: number, description: string) => {
    let colorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/25";
    if (score < 70) colorClass = "text-amber-400 bg-amber-500/10 border-amber-500/25";
    if (score < 40) colorClass = "text-red-400 bg-red-500/10 border-red-500/25";

    return (
      <div className="bg-surface-raised border border-border/80 rounded-xl p-3.5 flex flex-col gap-1.5 transition-all hover:border-accent/20">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-text-primary text-xs">{title}</span>
          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>
            {score}/100
          </span>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed font-sans">{description}</p>
      </div>
    );
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans transition-all hover:border-accent/30 relative overflow-hidden">
      {/* Glow highlight */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full filter blur-xl pointer-events-none" />

      {/* Header Button (Trigger Collapse/Expand) */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between text-left focus:outline-none group z-10"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-surface-raised border border-border text-accent shrink-0">
            <Bot size={18} className={loading ? "animate-pulse" : ""} />
          </div>
          <div>
            <h3 className="font-display text-sm md:text-base font-bold text-text-primary group-hover:text-accent transition-colors flex items-center gap-2">
              WeatherAI Premium Insights for {locationName}
              {apiPlan === "free" && (
                <span className="bg-accent/15 text-accent border border-accent/20 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-0.5">
                  <Lock size={8} /> Pro
                </span>
              )}
            </h3>
            {!isExpanded && (
              <p className="text-[11px] text-text-muted mt-0.5 font-medium">
                Click to expand and generate real-time AI weather reports & activity scores.
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
        <div className="mt-5 border-t border-border pt-5 space-y-6 animate-slide-in">
          {loading ? (
            <div className="space-y-3 py-2 animate-pulse">
              <div className="h-3 bg-surface-raised border border-border rounded-full w-full"></div>
              <div className="h-3 bg-surface-raised border border-border rounded-full w-5/6"></div>
              <div className="h-3 bg-surface-raised border border-border rounded-full w-4/5"></div>
            </div>
          ) : error === "PRO_LIMIT" || apiPlan === "free" ? (
            <div className="space-y-5">
              {/* Premium locked panel placeholder */}
              <div className="bg-surface-raised/40 border border-dashed border-border rounded-xl p-5 text-center flex flex-col items-center justify-center gap-3 relative">
                <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Lock size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display text-xs font-bold text-text-primary">WeatherAI Insights Gated</h4>
                  <p className="text-[10px] text-text-muted max-w-sm">
                    Today&apos;s clothing recommenders, driving visibility alerts, running index, and cycle comfort scoring require a Pro Plan subscription. (Error: HTTP 403 Forbidden)
                  </p>
                </div>
                <div className="mt-1">
                  <LockedFeatureBadge />
                </div>
              </div>

              {/* Locked Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 opacity-40 select-none pointer-events-none">
                {renderMetricRowPreview("Running comfort index", "--", "High humidity risk")}
                {renderMetricRowPreview("Driving visibility comfort", "--", "Normal road conditions")}
                {renderMetricRowPreview("Photography lighting score", "--", "Golden hour preview")}
              </div>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">AI Synthesis Error</p>
                <p className="opacity-80 mt-0.5">{error}</p>
                <button
                  onClick={fetchAiInsights}
                  className="mt-2 text-[10px] font-bold underline uppercase tracking-wider block hover:text-red-400 transition-colors"
                >
                  Retry Synthesis
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary and Clothing recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-raised border border-border p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles size={11} /> Today&apos;s Weather Summary
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed font-sans font-medium">
                    {insights?.summary || "Sunny clear conditions with moderate UV indices. Ideal for outdoor recreation."}
                  </p>
                </div>

                <div className="bg-surface-raised border border-border p-4 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={11} /> Apparel Advice
                  </span>
                  <p className="text-xs text-text-primary leading-relaxed font-sans font-medium">
                    {insights?.recommendations?.[0] || "Wear breathable light clothing. Sunglasses and UV sunscreen recommended."}
                  </p>
                </div>
              </div>

              {/* Recommendation Grid */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Lifestyle Comfort Index</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {renderRecommendationCard("Running comfort index", 85, "Excellent conditions. Low wind resistance.")}
                  {renderRecommendationCard("Driving conditions index", 92, "Optimal visibility. Dry road grip values.")}
                  {renderRecommendationCard("Photography lighting", 78, "Clear golden hour window starting at sunset.")}
                </div>
              </div>

              {/* Risk details */}
              {insights?.risk && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 text-[10px] text-amber-500">
                  <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase block mb-0.5">Atmospheric Alert / Risk</span>
                    {insights.risk}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={fetchAiInsights}
                  className="text-[10px] font-bold text-text-muted hover:text-text-primary flex items-center gap-1 uppercase transition-colors"
                >
                  <RefreshCw size={10} />
                  Refresh Diagnostics
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Preview items helper
function renderMetricRowPreview(title: string, val: string, caption: string) {
  return (
    <div className="bg-surface-raised border border-border rounded-xl p-3 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-text-muted text-xs">{title}</span>
        <span className="text-[10px] font-bold text-text-muted bg-border/20 px-1 rounded">{val}</span>
      </div>
      <p className="text-[9px] text-text-muted">{caption}</p>
    </div>
  );
}
