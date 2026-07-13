"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  MapPin,
  User,
  Gauge,
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
      title: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "trends", label: "Trends", icon: TrendingUp },
        { id: "comparison", label: "Comparison", icon: Layers },
      ],
    },
    {
      title: "LOCATIONS",
      items: [
        { id: "locations", label: "Saved Locations", icon: MapPin },
      ],
    },
    {
      title: "ACCOUNT",
      items: [
        { id: "profile", label: "Profile", icon: User },
        { id: "usage", label: "Usage & Quota", icon: Gauge },
      ],
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 bg-sidebar-bg border-r border-border transition-all duration-300 z-30 font-sans hidden md:flex flex-col ${
          sidebarCollapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-6">
          {navigation.map((group) => (
            <div key={group.title} className="flex flex-col gap-1">
              {!sidebarCollapsed && (
                <h3 className="text-[10px] font-bold text-text-muted px-3 mb-1.5 tracking-wider font-sans uppercase">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-all relative ${
                      isActive
                        ? "bg-accent-tint text-accent font-semibold"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar (renders on screen < 768px) */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-sidebar-bg border-t border-border flex items-center justify-around px-2 z-40 md:hidden font-sans">
        {navigation.flatMap(g => g.items).slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors ${
                isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={20} />
              <span className="text-[9px] font-medium leading-none">{item.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
