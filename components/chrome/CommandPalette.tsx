"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Search, MapPin, Compass, Command } from "lucide-react";

export default function CommandPalette() {
  const { activeModal, setActiveModal, savedLocations, setActiveLocation, setActiveView, showToast } = useAppStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isOpen = activeModal === "command_palette";

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActiveModal(isOpen ? null : "command_palette");
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, setActiveModal]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveModal(null);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActiveModal(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setActiveModal]);

  if (!isOpen) return null;

  const views = [
    { id: "dashboard", label: "Dashboard Overview", type: "nav" },
    { id: "trends", label: "Historical Trends", type: "nav" },
    { id: "comparison", label: "Multi-location Comparison", type: "nav" },
    { id: "locations", label: "Saved Locations Management", type: "nav" },
    { id: "logs", label: "API Request Logs", type: "nav" },
    { id: "playground", label: "API Developer Playground", type: "nav" },
    { id: "profile", label: "Account Profile Settings", type: "nav" },
    { id: "usage", label: "Quota & API Usage Summary", type: "nav" },
  ];

  const locations = savedLocations.map((loc) => ({
    id: loc.id,
    label: loc.name,
    type: "location",
    data: loc,
  }));

  const items = [...views, ...locations];
  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (item: any) => {
    if (item.type === "nav") {
      setActiveView(item.id);
      showToast(`Navigated to ${item.label}`, "info");
    } else if (item.type === "location") {
      setActiveLocation(item.data);
      setActiveView("dashboard");
      showToast(`Switched active location to ${item.label}`, "success");
    }
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 font-sans">
      <div
        ref={containerRef}
        className="bg-surface border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[400px] animate-slide-in"
      >
        <div className="flex items-center gap-3 px-4 border-b border-border py-3">
          <Search size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search dashboard pages or locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-text-primary focus:outline-none placeholder-text-muted"
          />
          <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted bg-surface-raised border border-border px-1.5 py-0.5 rounded uppercase">
            <Command size={10} />
            ESC
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-text-muted text-xs">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filtered.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs hover:bg-surface-raised transition-colors group text-text-muted hover:text-text-primary"
                >
                  <div className="flex items-center gap-2.5">
                    {item.type === "location" ? (
                      <MapPin size={15} className="text-accent/80 group-hover:text-accent" />
                    ) : (
                      <Compass size={15} className="text-text-muted group-hover:text-text-primary" />
                    )}
                    <span className="font-semibold text-text-primary">{item.label}</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded bg-surface-raised border border-border group-hover:border-accent-tint">
                    {item.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
