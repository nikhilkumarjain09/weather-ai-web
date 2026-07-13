"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WeatherResponse } from "@/lib/types";
import { addHistoricalEntry } from "@/lib/historicalStore";

// Chrome & Shared
import TopBar from "@/components/chrome/TopBar";
import Sidebar from "@/components/chrome/Sidebar";
import Toast from "@/components/shared/Toast";
import ErrorBanner from "@/components/shared/ErrorBanner";
import EmptyState from "@/components/shared/EmptyState";

// Modals
import SavedLocationsModal from "@/components/modals/SavedLocationsModal";
import KeyboardShortcutsModal from "@/components/modals/KeyboardShortcutsModal";
import SettingsModal from "@/components/modals/SettingsModal";

// Dashboard / Weather Panels
import StatCard from "@/components/dashboard/StatCard";
import ComparisonGrid from "@/components/dashboard/ComparisonGrid";
import CurrentConditions from "@/components/weather/CurrentConditions";
import ForecastStrip from "@/components/weather/ForecastStrip";
import HistoricalTrendChart from "@/components/weather/HistoricalTrendChart";
import AiSummaryPanel from "@/components/weather/AiSummaryPanel";

// Controls / Power Panels
import LocationSearch from "@/components/controls/LocationSearch";
import UnitToggle from "@/components/controls/UnitToggle";
import UsagePanel from "@/components/controls/UsagePanel";

// Icons
import {
  Send,
  Zap,
  Wifi,
  Package,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Compass,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  User,
} from "lucide-react";

export default function DashboardConsole() {
  const {
    userName,
    theme,
    unit,
    activeView,
    setActiveView,
    activeLocation,
    setActiveLocation,
    savedLocations,
    setActiveModal,
    apiPlan,
    showToast,
  } = useAppStore();

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({ requestsToday: 0, avgLatency: 0, cacheHitRate: 0 });

  // Sync client-side theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  // Main Weather Fetch Logic
  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();
    
    let url = "/api/weather";

    if (activeLocation) {
      url = `/api/weather?lat=${activeLocation.lat}&lon=${activeLocation.lon}&name=${encodeURIComponent(
        activeLocation.name
      )}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }
      const data: WeatherResponse = await res.json();
      setWeather(data);

      const latencyTime = Date.now() - startTime;

      // Update session metrics locally
      setMetrics((prev) => {
        const nextCount = prev.requestsToday + 1;
        const nextAvg = Math.round((prev.avgLatency * prev.requestsToday + latencyTime) / nextCount);
        const hitCount = (prev.cacheHitRate * prev.requestsToday) / 100 + (data._meta?.cache === "hit" ? 1 : 0);
        const nextHitRate = Math.round((hitCount / nextCount) * 100);
        return {
          requestsToday: nextCount,
          avgLatency: nextAvg,
          cacheHitRate: nextHitRate,
        };
      });

      // Record in historical trend logs
      if (data.current) {
        addHistoricalEntry(data.current.locationName, data.current.temp, data.current.humidity);
        window.dispatchEvent(new Event("aeris-data-fetched"));
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve meteorology data.");
      showToast("Weather fetch failed", "danger");
    } finally {
      setLoading(false);
    }
  }, [activeLocation, showToast]);

  // Trigger weather query on location shift
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Startup: Load default saved location if set
  useEffect(() => {
    const defaultLoc = savedLocations.find((loc) => loc.isDefault);
    if (defaultLoc) {
      setActiveLocation(defaultLoc);
    }
  }, [savedLocations, setActiveLocation]);

  // Global Hotkey Manager
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      // 'r' for refresh
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        fetchWeather();
        showToast("Refreshing console metrics...", "info");
      }

      // '1' to '9' keys
      if (e.key >= "1" && e.key <= "9") {
        const idx = parseInt(e.key) - 1;
        if (savedLocations[idx]) {
          e.preventDefault();
          setActiveLocation(savedLocations[idx]);
          showToast(`Active location: ${savedLocations[idx].name}`, "success");
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [savedLocations, fetchWeather, setActiveLocation, showToast]);

  // Greeting helpers
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return { text: "Good morning", icon: <Sunrise className="text-accent" size={24} /> };
    if (hours < 18) return { text: "Good afternoon", icon: <Sun className="text-accent" size={24} /> };
    return { text: "Good evening", icon: <Sunset className="text-accent" size={24} /> };
  };

  const greeting = getGreeting();
  const dateString = new Date().toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Render view router panels
  const renderPanel = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {error && <ErrorBanner message={error} onRetry={fetchWeather} isLoading={loading} />}
            {loading && !weather && (
              <div className="h-60 rounded-xl bg-surface border border-border animate-pulse flex items-center justify-center">
                <span className="text-xs text-text-muted">Querying station conditions...</span>
              </div>
            )}
            {weather && !loading && (
              <>
                <CurrentConditions
                  data={weather.current}
                  unit={unit}
                  onRefresh={fetchWeather}
                  isRefreshing={loading}
                />
                <ForecastStrip days={weather.forecast} unit={unit} />
                <AiSummaryPanel
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  locationName={weather.current.locationName}
                />
              </>
            )}
          </div>
        );
      case "trends":
        return (
          <HistoricalTrendChart
            locationName={weather?.current.locationName || activeLocation?.name || "San Francisco"}
            unit={unit}
          />
        );
      case "comparison":
        return <ComparisonGrid />;
      case "locations":
        return (
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-text-primary">Saved Locations list</h3>
              <button
                onClick={() => setActiveModal("saved_locations")}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                Manage Locations
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {savedLocations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setActiveLocation(loc);
                    setActiveView("dashboard");
                    showToast(`Active location: ${loc.name}`, "info");
                  }}
                  className={`p-4 border rounded-xl text-left bg-surface hover:bg-surface-raised transition-colors group relative ${
                    activeLocation?.id === loc.id ? "border-accent" : "border-border"
                  }`}
                >
                  <span className="font-semibold text-text-primary block">{loc.name}</span>
                  <span className="text-[10px] text-text-muted font-mono block mt-1">
                    {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°W
                  </span>
                  {loc.isDefault && (
                    <span className="absolute top-3 right-3 text-[9px] font-bold text-accent tracking-wide uppercase">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      case "profile":
        return (
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
            <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2 mb-1">
              <User className="text-accent" size={18} />
              Identity Profiles
            </h3>
            <p className="text-xs text-text-muted mb-6">Configure console profile parameters.</p>
            <button
              onClick={() => setActiveModal("settings")}
              className="px-4 py-2 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-colors"
            >
              Update Preferences
            </button>
          </div>
        );
      case "usage":
        return <UsagePanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans flex flex-col pt-14 pb-16 md:pb-0 md:pl-60">
      {/* Chrome Shell */}
      <TopBar />
      <Sidebar />

      {/* Main Console Content */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Console Greeting Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-surface border border-border shrink-0">
              {greeting.icon}
            </div>
            <div>
              <h1 className="font-display text-lg md:text-xl font-bold text-text-primary">
                {greeting.text}, <span className="text-accent">{userName || "Developer"}</span>
              </h1>
              <p className="text-xs text-text-muted font-medium mt-0.5">{dateString}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LocationSearch />
            <UnitToggle />
          </div>
        </div>

        {/* Dashboard Stat Cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Requests Today"
            icon={Send}
            value={metrics.requestsToday}
            caption="WeatherAI Proxies"
          />
          <StatCard
            label="Avg Response Time"
            icon={Zap}
            value={`${metrics.avgLatency}ms`}
            caption="Proxy Latency"
          />
          <StatCard
            label="Cache Hit Rate"
            icon={Wifi}
            value={`${metrics.cacheHitRate}%`}
            caption="Redis Caching"
          />
          <StatCard
            label="Monthly Quota"
            icon={Package}
            value={apiPlan === "pro" ? "12k / 50k" : "384 / 1k"}
            caption={`${apiPlan.toUpperCase()} Plan Quota`}
          />
        </div>

        {/* Active Route Section Panel */}
        <div className="mt-6">{renderPanel()}</div>
      </main>

      {/* Modals & Portal Overlays */}
      <SavedLocationsModal />
      <KeyboardShortcutsModal />
      <SettingsModal />
      <Toast />
    </div>
  );
}
