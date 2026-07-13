"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Keyboard, X } from "lucide-react";

export default function KeyboardShortcutsModal() {
  const { activeModal, setActiveModal } = useAppStore();

  const isOpen = activeModal === "shortcuts";

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Toggle shortcuts modal with '?' key (shift + /)
      if (e.key === "?" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        setActiveModal(isOpen ? null : "shortcuts");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setActiveModal]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ["/"], action: "Focus city & coordinate search" },
    { keys: ["r"], action: "Reload current location weather data" },
    { keys: ["1", "-", "9"], action: "Switch between corresponding saved locations" },
    { keys: ["Ctrl", "K"], action: "Open global command palette" },
    { keys: ["?"], action: "Toggle this keyboard shortcuts dialog" },
    { keys: ["ESC"], action: "Dismiss open modals or menus" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 relative animate-slide-in">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="text-accent" size={20} />
          <h2 className="font-display text-base font-bold text-text-primary">Keyboard Shortcuts</h2>
        </div>

        <div className="space-y-3">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border last:border-b-0 text-xs">
              <span className="text-text-muted">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="bg-surface-raised border border-border text-[9px] font-bold text-text-primary px-1.5 py-0.5 rounded uppercase font-mono shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
