"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Moon, Sun, Monitor, Thermometer, Keyboard, Settings } from "lucide-react";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { theme, setTheme, unit, toggleUnit, setActiveModal, showToast } = useAppStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleThemeChange = (newTheme: typeof theme) => {
    setTheme(newTheme);
    showToast(`Theme changed to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`, "info");
    
    // Apply changes instantly
    const root = document.documentElement;
    const isDark = newTheme === "dark" || (newTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-2.5 w-64 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-white/10 shadow-2xl py-2 z-50 animate-slide-in font-sans"
    >
      {/* Theme Selection */}
      <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 font-display">
          Theme mode
        </span>
        <div className="grid grid-cols-3 gap-1 bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-200/50 dark:border-white/5">
          <button
            onClick={() => handleThemeChange("dark")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              theme === "dark"
                ? "bg-accent text-white dark:text-bg font-bold shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Moon size={12} className="mb-0.5" />
            Dark
          </button>
          <button
            onClick={() => handleThemeChange("light")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              theme === "light"
                ? "bg-accent text-white dark:text-bg font-bold shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Sun size={12} className="mb-0.5" />
            Light
          </button>
          <button
            onClick={() => handleThemeChange("system")}
            className={`flex flex-col items-center justify-center py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
              theme === "system"
                ? "bg-accent text-white dark:text-bg font-bold shadow-sm"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            <Monitor size={12} className="mb-0.5" />
            System
          </button>
        </div>
      </div>

      {/* Quick Units Toggle */}
      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Temperature Units</span>
        </div>
        <button
          onClick={() => {
            toggleUnit();
            showToast(`Units switched to °${unit === "C" ? "F" : "C"}`, "info");
          }}
          className="bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded text-xs font-mono font-bold text-accent"
        >
          °{unit}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="py-1">
        <button
          onClick={() => {
            setActiveModal("shortcuts");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
        >
          <Keyboard size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="font-medium">Keyboard Shortcuts</span>
          <span className="ml-auto font-mono text-[9px] bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded">?</span>
        </button>

        <button
          onClick={() => {
            setActiveModal("settings");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-left"
        >
          <Settings size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}
