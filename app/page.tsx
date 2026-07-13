"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WeatherResponse, UsageResponse } from "@/services/weather/types";
import { addHistoricalEntry } from "@/lib/historicalStore";
import { weatherService } from "@/services/weather/service";
import {
  saveLastSuccessfulResponse,
  getLastSuccessfulResponse,
  saveLastCoordinates,
  getLastCoordinates,
} from "@/services/weather/cache";

// Chrome & Shared
import TopBar from "@/components/chrome/TopBar";
import Sidebar from "@/components/chrome/Sidebar";
import Toast from "@/components/shared/Toast";
import ErrorBanner from "@/components/shared/ErrorBanner";
import CommandPalette from "@/components/chrome/CommandPalette";

// Modals
import SavedLocationsModal from "@/components/modals/SavedLocationsModal";
import AlertSubscribeModal from "@/components/modals/AlertSubscribeModal";
import KeyboardShortcutsModal from "@/components/modals/KeyboardShortcutsModal";
import SettingsModal from "@/components/modals/SettingsModal";
import WelcomeModal from "@/components/modals/WelcomeModal";

// Dashboard / Weather Panels
import StatCard from "@/components/dashboard/StatCard";
import CompareConsole from "@/components/dashboard/CompareConsole";
import CurrentConditions from "@/components/weather/CurrentConditions";
import HourlyTimeline from "@/components/weather/HourlyTimeline";
import ForecastStrip from "@/components/weather/ForecastStrip";
import WeatherCharts from "@/components/dashboard/WeatherCharts";
import WeatherMap from "@/components/map/WeatherMap";
import HistoricalTrendChart from "@/components/weather/HistoricalTrendChart";
import AiSummaryPanel from "@/components/weather/AiSummaryPanel";
import AnimatedBackground from "@/components/weather/AnimatedBackground";

// Controls / Power Panels
import SearchBar from "@/components/controls/SearchBar";
import UnitToggle from "@/components/controls/UnitToggle";
import UsagePanel from "@/components/controls/UsagePanel";

// Icons
import {
  Package,
  Sunrise,
  Sun,
  Sunset,
  Plus,
  Lock,
  User,
  Thermometer,
  Droplets,
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
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState("");
  const [rateLimit, setRateLimit] = useState<{ limit: number; remaining: number; reset: number } | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
        if (data.plan) {
          useAppStore.setState({ apiPlan: data.plan.toLowerCase() as "free" | "pro" });
        }
      }
    } catch (e) {
      console.error("Failed to fetch usage:", e);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
    window.addEventListener("aeris-usage-updated", fetchUsage);
    return () => window.removeEventListener("aeris-usage-updated", fetchUsage);
  }, [fetchUsage, weather]);

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
    setIsOfflineMode(false);
    
    let lat = activeLocation?.lat;
    let lon = activeLocation?.lon;

    // Detect location if no active location (follows: GPS -> IP Lookup -> Default)
    if (lat === undefined || lon === undefined) {
      const cachedCoords = getLastCoordinates();
      if (cachedCoords) {
        lat = cachedCoords.lat;
        lon = cachedCoords.lon;
      } else if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
          });
          lat = position.coords.latitude;
          lon = position.coords.longitude;
          saveLastCoordinates(lat, lon);
          showToast("Retrieved GPS location coordinates", "success");
        } catch {
          // Denied or timeout -> fallback to IP Lookup
          try {
            const ipRes = await weatherService.getIpLookup();
            lat = ipRes.location.lat;
            lon = ipRes.location.lon;
            saveLastCoordinates(lat, lon);
            showToast(`Location resolved from IP: ${ipRes.location.city}`, "info");
          } catch {
            // Default coords fallback
            lat = 37.7749;
            lon = -122.4194;
          }
        }
      }
    }

    try {
      const data = await weatherService.getWeather({
        lat,
        lon,
        days: 7,
        ai: true,
        units: unit.toLowerCase() as any,
      });
      
      setWeather(data);
      saveLastSuccessfulResponse(data);
      if (lat !== undefined && lon !== undefined) {
        saveLastCoordinates(lat, lon);
      }

      // Record in historical trend logs
      if (data.current) {
        addHistoricalEntry(data.current.locationName, data.current.temp, data.current.humidity);
        window.dispatchEvent(new Event("aeris-data-fetched"));
      }
    } catch (err: any) {
      // Offline support: Fallback to last successful response
      const cachedResponse = getLastSuccessfulResponse();
      if (cachedResponse) {
        setWeather(cachedResponse.data);
        setIsOfflineMode(true);
        setLastUpdatedTime(new Date(cachedResponse.timestamp).toLocaleTimeString());
        showToast("Offline mode: loaded cached response", "warning");
      } else {
        setError(err.message || "Failed to retrieve meteorology data.");
        showToast("Weather fetch failed", "danger");
      }
    } finally {
      setLoading(false);
    }
  }, [activeLocation, unit, showToast]);

  // Rate Limit & Telemetry listener
  useEffect(() => {
    function handleRateLimit(e: any) {
      if (e.detail) {
        setRateLimit({
          limit: parseInt(e.detail.limit, 10),
          remaining: parseInt(e.detail.remaining, 10),
          reset: parseInt(e.detail.reset, 10),
        });
      }
    }
    window.addEventListener("aeris-rate-limit-updated", handleRateLimit);
    return () => window.removeEventListener("aeris-rate-limit-updated", handleRateLimit);
  }, []);

  // Trigger weather query on location shift
  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Welcome Modal first-launch trigger
  useEffect(() => {
    if (!userName) {
      setWelcomeOpen(true);
    }
  }, [userName]);

  const requestLocationAndFetch = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000 });
        });
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        saveLastCoordinates(lat, lon);
        setActiveLocation({
          id: "curr-gps",
          name: "Current Location",
          lat,
          lon,
          isDefault: false,
        });
        showToast("Switched weather focus to GPS location", "success");
      } catch {
        // Fallback to IP lookup
        try {
          const ipRes = await weatherService.getIpLookup();
          const lat = ipRes.location.lat;
          const lon = ipRes.location.lon;
          saveLastCoordinates(lat, lon);
          setActiveLocation({
            id: "curr-ip",
            name: ipRes.location.city,
            lat,
            lon,
            isDefault: false,
          });
          showToast(`Location resolved via IP: ${ipRes.location.city}`, "info");
        } catch {
          // Default coords
          showToast("Using default station: San Francisco", "warning");
        }
      }
    }
  }, [setActiveLocation, showToast]);

  // Startup: Load default saved location if set
  useEffect(() => {
    if (userName) {
      const defaultLoc = savedLocations.find((loc) => loc.isDefault);
      if (defaultLoc) {
        setActiveLocation(defaultLoc);
      } else {
        fetchWeather();
      }
    }
  }, [savedLocations, setActiveLocation, fetchWeather, userName]);

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

      // 'Escape' key to close modals
      if (e.key === "Escape") {
        e.preventDefault();
        useAppStore.setState({ activeModal: null });
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

                <HourlyTimeline
                  currentTemp={weather.current.temp}
                  minTemp={weather.forecast?.[0]?.minTemp ?? weather.current.temp - 5}
                  maxTemp={weather.forecast?.[0]?.maxTemp ?? weather.current.temp + 5}
                  conditionCode={weather.current.conditionsCode}
                  precipChance={weather.forecast?.[0]?.precipChance ?? 0}
                />

                <ForecastStrip days={weather.forecast} unit={unit} lat={weather.current.lat} lon={weather.current.lon} />

                <WeatherCharts
                  forecast={weather.forecast}
                  currentHumidity={weather.current.humidity}
                  currentWindSpeed={weather.current.windSpeed}
                  currentPressure={weather.current.pressure}
                />

                <WeatherMap
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                />

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
        return <CompareConsole />;
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
      case "alerts":
        return (
          <div className="bg-surface border border-border rounded-xl p-5 md:p-6 font-sans">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-2">
                  Alerting & Webhook Channels
                  {apiPlan === "free" && <Lock size={12} className="text-amber-500" />}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Pipe severe meteorological events to custom HTTP endpoints.
                </p>
              </div>
              <button
                onClick={() => setActiveModal("alert_subscribe")}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-colors flex items-center gap-1"
              >
                <Plus size={12} />
                Configure webhook
              </button>
            </div>
            
            {apiPlan === "free" ? (
              <div className="p-8 border border-dashed rounded-xl bg-surface-raised/50 border-border text-center mt-6">
                <Lock className="text-text-muted opacity-40 mb-3 mx-auto" size={32} />
                <h3 className="font-display text-sm font-bold text-text-primary mb-1">Gated configuration</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Alert webhooks, telemetry callbacks, and SMS notifications require a Pro plan subscription. Toggle your active plan in the Usage & Quota section.
                </p>
              </div>
            ) : (
              <div className="border border-border rounded-lg bg-surface-raised p-4 text-xs mt-6">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Registered webhooks</span>
                <div className="divide-y divide-border">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-text-primary font-bold">https://api.domain.com/weather-alerts</span>
                      <span className="block text-[10px] text-text-muted mt-0.5">Events: alert.storm, alert.temp_extreme</span>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}
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
    <div className="min-h-screen bg-bg text-text-primary font-sans flex flex-col pt-14 pb-16 md:pb-0 md:pl-60 relative">
      <AnimatedBackground conditionCode={weather?.current?.conditionsCode || "sunny"} />

      {/* Chrome Shell */}
      <TopBar />
      <Sidebar />

      {/* Main Console Content */}
      <main className="flex-1 p-4 md:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* Console Greeting Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-accent shrink-0 shadow-lg shadow-accent/5">
              {greeting.icon}
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                {greeting.text}, <span className="text-accent">{userName || "Explorer"}</span> 👋
              </h1>
              <p className="text-xs text-text-muted font-medium mt-0.5 tracking-wide uppercase">{dateString}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar />
            <UnitToggle />
          </div>
        </div>

        {isOfflineMode && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 p-3 rounded-lg flex items-center justify-between text-xs animate-slide-in">
            <span className="font-medium">
              Offline Mode: Displaying last cached weather conditions (Last updated: {lastUpdatedTime}).
            </span>
            <button
              onClick={fetchWeather}
              className="px-2.5 py-1 bg-amber-500 text-bg hover:bg-amber-600 rounded font-bold uppercase text-[10px] transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dashboard Stat Cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Current Temp"
            icon={Thermometer}
            value={weather?.current ? `${Math.round(unit === "F" ? (weather.current.temp * 9/5 + 32) : weather.current.temp)}°${unit}` : "--"}
            caption="Current Temperature"
          />
          <StatCard
            label="Feels Like"
            icon={Thermometer}
            value={weather?.current ? `${Math.round(unit === "F" ? (weather.current.feelsLike * 9/5 + 32) : weather.current.feelsLike)}°${unit}` : "--"}
            caption="Apparent Temperature"
          />
          <StatCard
            label="Humidity"
            icon={Droplets}
            value={weather?.current ? `${weather.current.humidity}%` : "--"}
            caption="Atmospheric Moisture"
          />
          <StatCard
            label="Monthly Quota"
            icon={Package}
            value={usage ? `${usage.used} / ${usage.limit}` : "--"}
            caption={usage ? `${usage.plan.toUpperCase()} Plan Quota` : "Usage Limits"}
          />
        </div>

        {/* Active Route Section Panel */}
        <div className="mt-6">{renderPanel()}</div>

        {/* Developer Telemetry Card */}
        <div className="bg-surface-raised border border-border/85 rounded-xl p-5 font-mono text-[10px] text-text-muted mt-8">
          <div className="flex items-center justify-between pb-2 border-b border-border/40 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary uppercase tracking-wider">Developer Diagnostic Telemetry</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="bg-accent/10 text-accent px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
              Plan Status: {apiPlan}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="block text-text-muted uppercase">Requests Limit:</span>
              <span className="text-text-primary font-bold">{rateLimit ? rateLimit.limit : "1000"}</span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">Requests Remaining:</span>
              <span className={`font-bold ${rateLimit && rateLimit.remaining < 100 ? "text-red-400 animate-pulse" : "text-text-primary"}`}>
                {rateLimit ? rateLimit.remaining : "984"}
              </span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">AI Requests Remaining:</span>
              <span className="text-text-primary font-bold">
                {rateLimit ? Math.max(0, Math.floor(rateLimit.remaining / 3)) : "328"}
              </span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">Reset Date:</span>
              <span className="text-text-primary font-bold truncate block">
                {rateLimit ? new Date(rateLimit.reset * 1000).toLocaleString() : "Next billing cycle"}
              </span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">Active Endpoint:</span>
              <span className="text-accent font-bold">/v1/weather</span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">Response Latency:</span>
              <span className="text-text-primary font-bold">{weather?._meta?.latency ? `${weather._meta.latency}ms` : "48ms"}</span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">Cache Node Status:</span>
              <span className="text-text-primary font-bold uppercase">{weather?._meta?.cache || "HIT"}</span>
            </div>
            <div>
              <span className="block text-text-muted uppercase">Target Host:</span>
              <span className="text-text-primary font-bold truncate block">api.weather-ai.co</span>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Portal Overlays */}
      <SavedLocationsModal />
      <AlertSubscribeModal />
      <KeyboardShortcutsModal />
      <SettingsModal />
      <CommandPalette />
      <WelcomeModal
        isOpen={welcomeOpen}
        onClose={() => setWelcomeOpen(false)}
        onRequestLocation={requestLocationAndFetch}
      />
      <Toast />
    </div>
  );
}
