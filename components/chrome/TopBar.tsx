"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Bell, ChevronDown, Menu, X, LayoutDashboard, TrendingUp, Layers, MapPin, Sparkles, Settings } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "../controls/SearchBar";
import { motion, AnimatePresence } from "framer-motion";
import { WeatherResponse } from "@/services/weather/types";
import AiInsightsModal from "../modals/AiInsightsModal";

interface TopBarProps {
  weather?: WeatherResponse | null;
}

export default function TopBar({ weather = null }: TopBarProps) {
  const { userName, notifications, activeView, setActiveView, apiPlan, activeLocation, setActiveModal } = useAppStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initial = userName ? userName.trim().charAt(0).toUpperCase() : "D";

  // Navigation link configurations (Webhooks/Alerts removed)
  const navigation = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "trends", label: "Trends", icon: TrendingUp },
    { id: "comparison", label: "Comparison", icon: Layers },
    { id: "locations", label: "Saved Locations", icon: MapPin },
  ];

  // Close drawer on Escape key or outside click
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsMenuOpen(false);
    }
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleNavClick = (id: string) => {
    setActiveView(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-between px-4 md:px-6 z-40 shadow-2xl transition-all duration-300">
        
        {/* Brand logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-1.5 shadow-md hover:scale-105 transition-transform duration-300">
            <img src="/assets/weather-icon.svg" alt="Aeris Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col hidden md:flex">
            <span className="font-display font-bold text-xs tracking-tight text-slate-900 dark:text-white leading-none font-sans">Aeris</span>
            <span className="text-[7px] text-slate-500 dark:text-slate-400 font-display font-bold uppercase tracking-widest leading-none mt-1">
              WeatherAI
            </span>
          </div>
          {activeLocation ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 sm:px-2.5 sm:py-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 text-[9px] md:text-[10px] font-bold tracking-tight max-w-[80px] sm:max-w-[130px] md:max-w-[170px] truncate ml-1 animate-slide-in">
              <MapPin size={9} className="text-accent shrink-0 animate-pulse" />
              <span className="truncate">{activeLocation.name}</span>
            </div>
          ) : (
            <div className="flex h-5 w-20 sm:w-32 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl animate-pulse ml-1 shrink-0" />
          )}
        </div>

        {/* Embedded Center Search Bar and AI Trigger */}
        <div className="flex-1 min-w-0 max-w-sm mx-1.5 sm:mx-4 flex items-center gap-1 sm:gap-2">
          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>
          {weather && (
            <button
              onClick={() => setIsInsightsOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all hover:scale-105 flex items-center justify-center shadow-lg shadow-accent/15 shrink-0"
              title="Get AI Weather Insights"
            >
              <Sparkles size={13} className="animate-pulse" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Notification Bell (Hidden on mobile) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all relative hover:scale-105 flex items-center justify-center"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent border border-slate-950 animate-pulse" />
              )}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* User Profile (Hidden on mobile) */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all group text-left hover:scale-[1.02]"
            >
              <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center text-[9px] font-bold text-accent">
                {initial}
              </div>
              <ChevronDown size={11} className="text-slate-500 dark:text-slate-400 group-hover:text-slate-900 group-hover:dark:text-white transition-transform duration-200" />
            </button>
            <ProfileMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>

          {/* Top Menu Trigger (Sidebar Replacement) */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-xl bg-accent text-bg hover:bg-accent/90 transition-all hover:scale-105 flex items-center justify-center shadow-lg shadow-accent/15"
          >
            <Menu size={15} />
          </button>
        </div>
      </header>

      {/* Slide-in Navigation Drawer Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />

            {/* Slideout Panel */}
            <motion.div
              ref={drawerRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-l border-slate-200 dark:border-white/5 p-6 z-50 flex flex-col justify-between shadow-2xl font-sans"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-1 hover:scale-105 transition-transform duration-300">
                      <img src="/assets/weather-icon.svg" alt="Aeris Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white">Menu Navigation</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Nav Items Link List */}
                <div className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    const isLocked = item.id === "alerts" && apiPlan === "free";

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all border ${
                          isActive
                            ? "bg-accent/15 border-accent/20 text-accent font-bold"
                            : "bg-transparent border-transparent text-slate-500 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon size={16} />
                        <span className="flex-1 text-left font-medium">{item.label}</span>
                        {isLocked && (
                          <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 px-1 rounded text-[8px] font-bold uppercase">
                            Pro
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Mobile-Only Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-white/5 sm:hidden">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1 font-display">
                    Quick Actions
                  </span>
                  
                  {/* AI insights option */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsInsightsOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all border bg-accent/10 border-accent/20 text-accent font-bold hover:bg-accent/20"
                  >
                    <Sparkles size={15} className="animate-pulse" />
                    <span className="flex-1 text-left font-semibold">AI Insights Report</span>
                    <span className="bg-accent text-white dark:text-bg px-1 rounded text-[7px] font-bold uppercase tracking-wider">
                      Live
                    </span>
                  </button>

                  {/* Settings option */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setActiveModal("settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all border bg-transparent border-transparent text-slate-500 dark:text-text-muted hover:text-slate-900 dark:hover:text-text-primary hover:bg-slate-100 dark:hover:bg-white/5"
                  >
                    <Settings size={15} />
                    <span className="flex-1 text-left font-medium">User Settings</span>
                  </button>
                </div>
              </div>

              {/* Bottom Brand footer */}
              <div className="text-center space-y-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-display font-bold uppercase tracking-wider block">
                  Aeris Weather Platform
                </span>
                <span className="text-[8px] text-slate-400/60 dark:text-slate-500/60 block leading-snug">
                  Designed by AVITA. All systems functional.
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Groq AI Insights Modal */}
      <AiInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        weather={weather}
      />
    </>
  );
}
