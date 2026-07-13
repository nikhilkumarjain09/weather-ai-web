"use client";

import React, { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Gauge, ShieldCheck, RefreshCw, Zap } from "lucide-react";

export default function UsagePanel() {
  const { apiPlan, setApiPlan, showToast } = useAppStore();
  const [usage, setUsage] = useState({ used: 384, limit: 1000, resetDays: 18 });
  const [loading, setLoading] = useState(false);

  const fetchUsage = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const json = await res.json();
        setUsage({
          used: json.used,
          limit: json.limit,
          resetDays: json.resetDays,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [apiPlan]);

  const togglePlan = () => {
    const nextPlan = apiPlan === "free" ? "pro" : "free";
    setApiPlan(nextPlan);
    showToast(`Simulated subscription plan changed to ${nextPlan.toUpperCase()}`, "success");
  };

  const percentage = Math.min(100, Math.round((usage.used / usage.limit) * 100));

  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
            <Gauge className="text-accent" size={18} />
            Quota & API Usage
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Monitor API transaction volumes and plan allocation thresholds.
          </p>
        </div>

        <button
          onClick={fetchUsage}
          disabled={loading}
          className="p-1.5 rounded border border-border hover:bg-surface-raised transition-colors text-text-muted hover:text-text-primary"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Progress gauge */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-baseline text-xs font-semibold">
            <span className="text-text-muted">Monthly Transaction Volume</span>
            <span className="font-mono text-text-primary">
              {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} requests
            </span>
          </div>

          <div className="w-full bg-surface-raised border border-border rounded-full h-3 overflow-hidden">
            <div
              className="bg-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-wider">
            <span>{percentage}% Used</span>
            <span>Resets in {usage.resetDays} days</span>
          </div>
        </div>

        {/* Plan Configuration Action */}
        <div className="bg-surface-raised border border-border rounded-lg p-4 flex flex-col justify-center items-center text-center">
          <div className="w-8 h-8 rounded-full bg-accent-tint/30 flex items-center justify-center text-accent mb-2">
            <Zap size={16} />
          </div>
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">ACTIVE SUBSCRIPTION</span>
          <span className="text-xs font-mono font-extrabold text-accent uppercase tracking-widest mt-0.5 mb-3">
            {apiPlan} PLAN
          </span>

          <button
            onClick={togglePlan}
            className="w-full py-1.5 rounded text-xs font-semibold border border-accent hover:bg-accent-tint text-accent transition-colors"
          >
            Switch to {apiPlan === "free" ? "Pro" : "Free"}
          </button>
        </div>
      </div>
    </div>
  );
}
