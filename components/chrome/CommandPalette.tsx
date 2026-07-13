"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUiStore } from "@/store/uiStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Search,
  Monitor,
  Moon,
  Sun,
  LayoutDashboard,
  TrendingUp,
  Layers,
  MapPin,
  BellRing,
  Gauge,
  Keyboard,
  Settings,
  Thermometer,
} from "lucide-react";

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveView, setActiveModal } = useUiStore();
  const { setTheme, toggleUnit, unit } = usePreferencesStore();
  const { savedLocations, setActiveLocation } = useFavoritesStore();
  const { showToast } = useSettingsStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Toggle Command Palette on Ctrl+K / Cmd+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Build command palette options list
  const allCommands = [
    // Views
    { icon: LayoutDashboard, label: "Go to Dashboard Console", action: () => { setActiveView("dashboard"); setCommandPaletteOpen(false); } },
    { icon: TrendingUp, label: "Go to Trends & Log History", action: () => { setActiveView("trends"); setCommandPaletteOpen(false); } },
    { icon: Layers, label: "Go to Multi-Location Comparison Grid", action: () => { setActiveView("comparison"); setCommandPaletteOpen(false); } },
    { icon: MapPin, label: "Go to Saved Locations List", action: () => { setActiveView("locations"); setCommandPaletteOpen(false); } },
    { icon: Gauge, label: "Go to Quota & API Usage", action: () => { setActiveView("usage"); setCommandPaletteOpen(false); } },
    { icon: BellRing, label: "Go to Alerts & Webhooks", action: () => { setActiveView("alerts"); setCommandPaletteOpen(false); } },
    
    // Preferences & Theme
    { icon: Moon, label: "Switch to Dark Theme", action: () => { setTheme("dark"); showToast("Theme changed to Dark", "info"); setCommandPaletteOpen(false); } },
    { icon: Sun, label: "Switch to Light Theme", action: () => { setTheme("light"); showToast("Theme changed to Light", "info"); setCommandPaletteOpen(false); } },
    { icon: Monitor, label: "Switch to System Theme", action: () => { setTheme("system"); showToast("Theme changed to System Default", "info"); setCommandPaletteOpen(false); } },
    { icon: Thermometer, label: `Toggle Temperature Units (Current: °${unit})`, action: () => { toggleUnit(); showToast(`Units toggled to °${unit === "C" ? "F" : "C"}`, "info"); setCommandPaletteOpen(false); } },

    // Modals
    { icon: Settings, label: "Open Settings Panel Modal", action: () => { setActiveModal("settings"); setCommandPaletteOpen(false); } },
    { icon: Keyboard, label: "Open Keyboard Shortcuts Panel", action: () => { setActiveModal("shortcuts"); setCommandPaletteOpen(false); } },
    { icon: BellRing, label: "Open Configure Webhook Alerts Modal", action: () => { setActiveModal("alert_subscribe"); setCommandPaletteOpen(false); } },
    { icon: MapPin, label: "Open Saved Locations Manager Modal", action: () => { setActiveModal("saved_locations"); setCommandPaletteOpen(false); } },

    // Dynamic Locations
    ...savedLocations.map((loc) => ({
      icon: MapPin,
      label: `Switch Location: ${loc.name}`,
      action: () => {
        setActiveLocation(loc);
        showToast(`Switched active location to ${loc.name}`, "info");
        setCommandPaletteOpen(false);
      },
    })),
  ];

  const filteredCommands = allCommands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      // Scroll into view
      const selectedEl = listRef.current?.children[selectedIndex + 1] as HTMLElement;
      selectedEl?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      const selectedEl = listRef.current?.children[selectedIndex - 1] as HTMLElement;
      selectedEl?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  return (
    <div
      onClick={() => setCommandPaletteOpen(false)}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 md:p-12 font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="bg-surface border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden mt-10 md:mt-20 flex flex-col max-h-[400px] animate-slide-in"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search location..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none placeholder-text-muted font-sans"
          />
          <span className="text-[10px] bg-surface-raised border border-border px-1.5 py-0.5 rounded text-text-muted font-mono uppercase">
            ESC
          </span>
        </div>

        {/* Options List */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-2 divide-y divide-border/20 max-h-[300px]">
          {filteredCommands.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">No results found matching query.</p>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const CmdIcon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={idx}
                  onClick={cmd.action}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-accent-tint text-accent font-semibold"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-raised/40"
                  }`}
                >
                  <CmdIcon size={16} className={isSelected ? "text-accent" : "text-text-muted"} />
                  <span className="flex-1 truncate">{cmd.label}</span>
                  {isSelected && (
                    <span className="text-[9px] bg-accent/15 border border-accent/20 px-1.5 py-0.5 rounded text-accent font-mono">
                      ENTER
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
