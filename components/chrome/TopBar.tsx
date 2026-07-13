"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Bell, ChevronDown, Sparkles } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileMenu from "./ProfileMenu";

export default function TopBar() {
  const { userName, notifications } = useAppStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "D";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-950/60 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-40 font-sans">
      {/* Brand logo / tagline */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent via-indigo-600 to-purple-600 flex items-center justify-center font-display font-black text-white text-sm shadow-lg shadow-accent/25 hover:scale-105 transition-transform duration-300">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-sm tracking-tight text-text-primary leading-none">Aeris</span>
          <span className="text-[8px] text-text-muted font-display font-bold uppercase tracking-widest leading-none mt-1 flex items-center gap-0.5">
            <Sparkles size={8} className="text-accent" /> WeatherAI Native
          </span>
        </div>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-text-muted hover:text-text-primary transition-all relative hover:scale-105"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent border border-slate-950 animate-pulse" />
            )}
          </button>
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group text-left hover:scale-[1.02]"
          >
            <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
              {initial}
            </div>
            <span className="text-xs font-semibold text-text-muted group-hover:text-text-primary hidden sm:inline max-w-[120px] truncate">
              {userName || "Developer"}
            </span>
            <ChevronDown size={12} className="text-text-muted group-hover:text-text-primary transition-transform duration-200" />
          </button>
          <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
      </div>
    </header>
  );
}
