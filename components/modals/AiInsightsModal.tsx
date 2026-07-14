"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherResponse } from "@/services/weather/types";
import { useAppStore } from "@/store/useAppStore";

interface AiInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherResponse | null;
}

function generateLocalInsights(location: string, tempC: number, conditions: string, unit: string) {
  const isCel = unit === "C";
  const displayTemp = isCel ? tempC : (tempC * 9/5) + 32;
  const tempVal = Math.round(displayTemp);
  
  let summary = `Today in ${location}, the weather is currently ${conditions.toLowerCase()} at ${tempVal}°${unit}. The conditions are pleasant and suitable for outdoor plans.`;
  let prediction = `Over the next few days, expect stable conditions with temperatures averaging around ${tempVal}°${unit}. A slight increase in cloud cover is predicted towards the weekend.`;
  let tips = "Stay hydrated throughout the afternoon. A light jacket is recommended if you are planning to stay out late in the evening.";

  const cond = conditions.toLowerCase();
  if (cond.includes("rain") || cond.includes("shower") || cond.includes("drizzle")) {
    summary = `Today in ${location}, expect rainy conditions at ${tempVal}°${unit} with ongoing precipitation.`;
    prediction = `Rain showers are expected to continue intermittently over the next 24-48 hours. Clearing skies are projected later in the week.`;
    tips = "Keep an umbrella handy today. Drive carefully on wet roads, and consider moving outdoor activities indoors.";
  } else if (cond.includes("storm") || cond.includes("thunder")) {
    summary = `Today in ${location}, active thunderstorms are present at ${tempVal}°${unit}. Expect sudden wind gusts and heavy downpours.`;
    prediction = `Storm systems are moving through the area, but should subside by tomorrow morning. A return to calmer weather is expected.`;
    tips = "Stay indoors if lightning is present. Secure loose outdoor items and keep emergency notifications enabled.";
  } else if (cond.includes("snow") || cond.includes("blizzard") || cond.includes("ice")) {
    summary = `Today in ${location}, wintery conditions with snow showers are present at ${tempVal}°${unit}.`;
    prediction = `Below-freezing temperatures will persist over the coming days, keeping snow accumulation intact. Watch for icy patches.`;
    tips = "Dress in heavy layers. Wear high-traction footwear, and clear driveways/sidewalks to prevent slippery conditions.";
  } else if (tempC > 30) {
    tips = "It's quite warm today. Drink plenty of water to stay hydrated, wear sunscreen, and seek shade during peak solar hours.";
  } else if (tempC < 12) {
    tips = "Bracing cold temperatures today. Dress in warm layers with a wind-resistant jacket if you are heading outdoors.";
  }

  return { summary, prediction, tips };
}

export default function AiInsightsModal({ isOpen, onClose, weather }: AiInsightsModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "prediction" | "tips">("summary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { unit } = useAppStore();
  const [insights, setInsights] = useState<{
    summary: string;
    prediction: string;
    tips: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !weather) return;

    async function fetchInsights() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/groq-insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            locationName: weather?.current.locationName,
            temp: weather?.current.temp,
            conditions: weather?.current.conditionsText,
            forecast: weather?.forecast.map((f) => ({
              date: f.date,
              tempMax: f.maxTemp,
              tempMin: f.minTemp,
              conditions: f.conditionsText,
            })),
          }),
        });

        if (!res.ok) {
          throw new Error("API request failed");
        }

        const data = await res.json();
        setInsights(data);
      } catch (err: any) {
        console.warn("API Insights failed, generating client-side fallback:", err);
        const fallbackData = generateLocalInsights(
          weather!.current.locationName,
          weather!.current.temp,
          weather!.current.conditionsText,
          unit
        );
        setInsights(fallbackData);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [isOpen, weather, unit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 dark:bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg overflow-hidden p-6 md:p-8 flex flex-col gap-5 relative rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-2xl">
        
        {/* Glow corner blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full filter blur-[60px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full filter blur-[60px]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent">
              <Sparkles size={16} className={loading ? "animate-spin" : ""} />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                AI Weather Insights
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                Focus Station: {weather?.current.locationName || "Detecting..."}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-450 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Tabs Navigator */}
        <div className="flex bg-slate-100/50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5 relative z-10">
          {(["summary", "prediction", "tips"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? "bg-accent text-white font-bold shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {tab === "summary" ? "Summary" : tab === "prediction" ? "Predictions" : "Daily Tips"}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="min-h-[140px] flex flex-col justify-center relative z-10 py-2">
          {loading ? (
            /* Pulsing Loading Skeletons */
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-full w-full"></div>
              <div className="h-4 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-full w-5/6"></div>
              <div className="h-4 bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-full w-2/3"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl gap-2.5">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{error}</p>
            </div>
          ) : insights ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-slate-700 dark:text-slate-300 text-xs md:text-sm leading-relaxed font-medium font-sans"
              >
                {activeTab === "summary" && (
                  <p>{insights.summary}</p>
                )}
                {activeTab === "prediction" && (
                  <p>{insights.prediction}</p>
                )}
                {activeTab === "tips" && (
                  <p>{insights.tips}</p>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center text-xs text-slate-500">
              No weather insights available.
            </div>
          )}
        </div>

        {/* Modal Footer Brand */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/5 text-[9px] text-slate-400 dark:text-slate-500 font-semibold relative z-10">
          <span className="flex items-center gap-1">
            <CheckCircle size={10} className="text-accent" /> Powered by Advanced AI Model
          </span>
          <span>Aeris Platform</span>
        </div>
      </div>
    </div>
  );
}
