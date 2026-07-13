"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  MapPin,
  BellRing,
  Gauge,
  Lock,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  proGated?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const { activeView, setActiveView, sidebarCollapsed, apiPlan } = useAppStore();

  const navigation: NavGroup[] = [
    {
      title: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "trends", label: "Trends", icon: TrendingUp },
        { id: "comparison", label: "Comparison", icon: Layers },
      ],
    },
    {
      title: "Locations",
      items: [
        { id: "locations", label: "Saved Locations", icon: MapPin },
      ],
    },
    {
      title: "Settings",
      items: [
        { id: "alerts", label: "Alerts & Webhooks", icon: BellRing, proGated: true },
        { id: "usage", label: "Usage & Quota", icon: Gauge },
      ],
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 bg-sidebar-bg/60 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-30 font-sans hidden md:flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-16 lg:w-60"
        }`}
      >
        <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
          {navigation.map((group) => (
            <div key={group.title} className="flex flex-col gap-1.5">
              {!sidebarCollapsed && (
                <h3 className="text-[9px] font-bold text-text-muted/60 px-3 mb-1.5 tracking-widest font-display uppercase hidden lg:block">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isLocked = item.proGated && apiPlan === "free";

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all relative ${
                      isActive
                        ? "bg-accent/15 text-accent font-bold border border-accent/20"
                        : "text-text-muted hover:text-text-primary hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon size={16} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left hidden lg:block font-medium">{item.label}</span>
                    )}
                    {!sidebarCollapsed && isLocked && (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/25 p-0.5 rounded text-[8px] font-bold uppercase hidden lg:block flex items-center gap-0.5">
                        <Lock size={8} /> Pro
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar (renders on screen < 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/70 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 z-40 md:hidden font-sans">
        {navigation.flatMap(g => g.items).slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all ${
                isActive ? "text-accent scale-105" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={18} />
              <span className="text-[8px] font-bold uppercase tracking-wider">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
