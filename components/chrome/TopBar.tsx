"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Bell, ChevronDown } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileMenu from "./ProfileMenu";

export default function TopBar() {
  const { userName, notifications } = useAppStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "D";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-sidebar-bg border-b border-border flex items-center justify-between px-4 z-40 font-sans">
      {/* Brand logo / tagline */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent to-teal-600 flex items-center justify-center font-display font-black text-bg text-base tracking-wider shadow-md">
          A
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-sm tracking-tight text-text-primary">Aeris</span>
          <span className="text-[9px] text-text-muted font-sans font-medium uppercase tracking-widest leading-none">WeatherAI Native</span>
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
            className="p-1.5 rounded-full hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border border-sidebar-bg animate-pulse" />
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
            className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-raised transition-colors group text-left"
          >
            <div className="w-7 h-7 rounded-full bg-accent-tint border border-accent/20 flex items-center justify-center text-xs font-bold text-accent">
              {initial}
            </div>
            <span className="text-xs font-semibold text-text-muted group-hover:text-text-primary hidden sm:inline max-w-[120px] truncate">
              {userName || "Developer"}
            </span>
            <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary transition-transform duration-200" />
          </button>
          <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
      </div>
    </header>
  );
}
