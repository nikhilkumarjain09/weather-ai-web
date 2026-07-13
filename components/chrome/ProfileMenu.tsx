"use client";

import React, { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Moon, Sun, Monitor, Thermometer, Keyboard, BookOpen, Settings, LogOut } from "lucide-react";

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileMenu({ isOpen, onClose }: ProfileMenuProps) {
  const { theme, setTheme, unit, toggleUnit, setActiveModal, setUserName, showToast } = useAppStore();
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

  const handleSignOut = () => {
    setUserName(null);
    showToast("Signed out successfully", "info");
    setActiveModal("name_prompt");
    onClose();
  };

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
      className="absolute right-0 mt-2 w-64 rounded-lg bg-surface border border-border shadow-xl py-2 z-50 animate-slide-in font-sans"
    >
      {/* Theme Selection */}
      <div className="px-4 py-2 border-b border-border">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-2">Theme</span>
        <div className="grid grid-cols-3 gap-1 bg-surface-raised p-1 rounded-md border border-border">
          <button
            onClick={() => handleThemeChange("dark")}
            className={`flex flex-col items-center justify-center py-1 rounded text-xs transition-colors ${
              theme === "dark" ? "bg-accent/15 text-accent font-semibold" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Moon size={14} className="mb-0.5" />
            Dark
          </button>
          <button
            onClick={() => handleThemeChange("light")}
            className={`flex flex-col items-center justify-center py-1 rounded text-xs transition-colors ${
              theme === "light" ? "bg-accent/15 text-accent font-semibold" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Sun size={14} className="mb-0.5" />
            Light
          </button>
          <button
            onClick={() => handleThemeChange("system")}
            className={`flex flex-col items-center justify-center py-1 rounded text-xs transition-colors ${
              theme === "system" ? "bg-accent/15 text-accent font-semibold" : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Monitor size={14} className="mb-0.5" />
            System
          </button>
        </div>
      </div>

      {/* Quick Units Toggle */}
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer size={16} className="text-text-muted" />
          <span className="text-xs font-semibold text-text-primary">Temperature Units</span>
        </div>
        <button
          onClick={() => {
            toggleUnit();
            showToast(`Units switched to °${unit === "C" ? "F" : "C"}`, "info");
          }}
          className="bg-surface-raised hover:bg-surface-raised/80 border border-border px-2 py-0.5 rounded text-xs font-mono font-bold text-accent"
        >
          °{unit}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="py-1 border-b border-border">
        <button
          onClick={() => {
            setActiveModal("shortcuts");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <Keyboard size={16} />
          <span>Keyboard Shortcuts</span>
          <span className="ml-auto font-mono text-[9px] bg-surface-raised border border-border px-1 rounded">?</span>
        </button>
        <a
          href="https://weather-ai.co/docs"
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <BookOpen size={16} />
          <span>API Documentation</span>
        </a>
        <button
          onClick={() => {
            setActiveModal("settings");
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>

      {/* Sign Out */}
      <div className="py-1">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
