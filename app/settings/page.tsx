"use client";

import React, { useEffect } from "react";
import TopBar from "@/components/chrome/TopBar";
import Sidebar from "@/components/chrome/Sidebar";
import Toast from "@/components/shared/Toast";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useUiStore } from "@/store/uiStore";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  Globe,
  Navigation,
  Sliders,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const {
    unit,
    setUnit,
    theme,
    setTheme,
    language,
    setLanguage,
    animationsEnabled,
    setAnimationsEnabled,
  } = usePreferencesStore();

  const {
    userName,
    setUserName,
    locationPermission,
    setLocationPermission,
    privacyMode,
    setPrivacyMode,
    showToast,
  } = useSettingsStore();

  const { setActiveView } = useUiStore();

  // Switch view on sidebar load
  useEffect(() => {
    setActiveView("profile");
  }, [setActiveView]);

  const handleReset = () => {
    localStorage.clear();
    showToast("Application cache reset successfully. Reloading...", "warning");
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    const root = document.documentElement;
    const isDark =
      newTheme === "dark" ||
      (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    showToast(`Theme changed to ${newTheme.toUpperCase()}`, "info");
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-sans flex flex-col pt-14 pb-16 md:pb-0 md:pl-60">
      <TopBar />
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 max-w-4xl w-full mx-auto space-y-6">
        {/* Settings Header */}
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <div className="p-2 rounded bg-surface border border-border text-accent shrink-0">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold text-text-primary">
              System Settings
            </h1>
            <p className="text-xs text-text-muted mt-0.5">
              Customize preferences, localization parameters, and data caching.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Settings Category Navigation */}
          <div className="bg-surface border border-border rounded-xl p-3 flex flex-col gap-1">
            <button className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold bg-accent-tint text-accent text-left">
              <Sliders size={14} />
              General Preferences
            </button>
          </div>

          {/* Settings Configuration Panels */}
          <div className="md:col-span-2 space-y-6">
            {/* Identity section */}
            <div className="bg-surface border border-border rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2 pb-2.5 border-b border-border/60">
                <User size={15} className="text-accent" />
                Profile Details
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Display Name
                </label>
                <input
                  type="text"
                  value={userName || ""}
                  placeholder="Enter your name"
                  onChange={(e) => setUserName(e.target.value || null)}
                  className="bg-surface-raised border border-border rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent/40 font-sans"
                />
              </div>
            </div>

            {/* Theme & Display section */}
            <div className="bg-surface border border-border rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2 pb-2.5 border-b border-border/60">
                <Monitor size={15} className="text-accent" />
                Theme & Unit Configurations
              </h3>

              {/* Theme Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Active Color Theme
                </span>
                <div className="grid grid-cols-3 gap-2 bg-surface-raised p-1 rounded-lg border border-border">
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-all ${
                      theme === "dark" ? "bg-surface border border-border text-accent shadow-sm" : "text-text-muted"
                    }`}
                  >
                    <Moon size={13} />
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-all ${
                      theme === "light" ? "bg-surface border border-border text-accent shadow-sm" : "text-text-muted"
                    }`}
                  >
                    <Sun size={13} />
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange("system")}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-semibold transition-all ${
                      theme === "system" ? "bg-surface border border-border text-accent shadow-sm" : "text-text-muted"
                    }`}
                  >
                    <Monitor size={13} />
                    System
                  </button>
                </div>
              </div>

              {/* Units picker */}
              <div className="flex flex-col gap-2 pt-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Temperature Units
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setUnit("C");
                      showToast("Switched unit to Celsius", "info");
                    }}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                      unit === "C"
                        ? "bg-accent border-accent text-bg"
                        : "bg-surface-raised border-border text-text-muted"
                    }`}
                  >
                    Celsius (°C)
                  </button>
                  <button
                    onClick={() => {
                      setUnit("F");
                      showToast("Switched unit to Fahrenheit", "info");
                    }}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                      unit === "F"
                        ? "bg-accent border-accent text-bg"
                        : "bg-surface-raised border-border text-text-muted"
                    }`}
                  >
                    Fahrenheit (°F)
                  </button>
                </div>
              </div>
            </div>

            {/* Localization section */}
            <div className="bg-surface border border-border rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2 pb-2.5 border-b border-border/60">
                <Globe size={15} className="text-accent" />
                Language Settings
              </h3>
              <div className="flex flex-col gap-2">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    showToast(`Language set to ${e.target.value.toUpperCase()}`, "info");
                  }}
                  className="bg-surface-raised border border-border rounded px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40 font-sans"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español (ES)</option>
                  <option value="fr">Français (FR)</option>
                  <option value="de">Deutsch (DE)</option>
                </select>
              </div>
            </div>

            {/* Accessibility & Permissions section */}
            <div className="bg-surface border border-border rounded-xl p-5 md:p-6 space-y-4">
              <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2 pb-2.5 border-b border-border/60">
                <Navigation size={15} className="text-accent" />
                Privacy & Animation Defaults
              </h3>

              {/* Geolocation indicator toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-text-primary">
                    Location Permissions
                  </span>
                  <span className="block text-[10px] text-text-muted mt-0.5">
                    Permission state for retrieving automatic GeoIP readings.
                  </span>
                </div>
                <select
                  value={locationPermission}
                  onChange={(e) => setLocationPermission(e.target.value as any)}
                  className="bg-surface-raised border border-border rounded px-2.5 py-1 text-xs text-text-primary focus:outline-none"
                >
                  <option value="prompt">Prompt (Default)</option>
                  <option value="granted">Granted</option>
                  <option value="denied">Blocked</option>
                </select>
              </div>

              {/* Animation toggles */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="block text-xs font-bold text-text-primary">
                    Enable System Animations
                  </span>
                  <span className="block text-[10px] text-text-muted mt-0.5">
                    Toggle interface transitions and weather backgrounds.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAnimationsEnabled(!animationsEnabled);
                    showToast(`Animations ${!animationsEnabled ? "enabled" : "disabled"}`, "info");
                  }}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    animationsEnabled ? "bg-accent" : "bg-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-bg rounded-full shadow-sm transform transition-transform ${
                      animationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Privacy Mode toggle */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="block text-xs font-bold text-text-primary">
                    Console Privacy Mode
                  </span>
                  <span className="block text-[10px] text-text-muted mt-0.5">
                    Hides geolocation markings and coordinates in dashboards.
                  </span>
                </div>
                <button
                  onClick={() => {
                    setPrivacyMode(!privacyMode);
                    showToast(`Privacy mode ${!privacyMode ? "activated" : "deactivated"}`, "info");
                  }}
                  className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                    privacyMode ? "bg-accent" : "bg-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-bg rounded-full shadow-sm transform transition-transform ${
                      privacyMode ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reset Defaults */}
            <div className="bg-surface border border-border rounded-xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold text-text-primary">
                  Clear Application Cache
                </span>
                <span className="block text-[10px] text-text-muted mt-0.5">
                  Restores system to factory default saved locations.
                </span>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center gap-1.5 justify-center"
              >
                <RotateCcw size={14} />
                Reset App Data
              </button>
            </div>
          </div>
        </div>
      </main>

      <Toast />
    </div>
  );
}
