"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Settings, X } from "lucide-react";

export default function SettingsModal() {
  const { activeModal, setActiveModal, userName, setUserName, savedLocations, showToast } = useAppStore();
  const [nameInput, setNameInput] = useState(userName || "");
  const [defaultLocId, setDefaultLocId] = useState(
    savedLocations.find((loc) => loc.isDefault)?.id || ""
  );

  const isOpen = activeModal === "settings";

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }

    // Update defaults in savedLocations list
    // (In our store structure, we can map them)
    const { savedLocations: locations } = useAppStore.getState();
    const updated = locations.map((loc) => ({
      ...loc,
      isDefault: loc.id === defaultLocId,
    }));
    useAppStore.setState({ savedLocations: updated });

    showToast("Preferences updated successfully", "success");
    setActiveModal(null);
  };

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
          <Settings className="text-accent" size={20} />
          <h2 className="font-display text-base font-bold text-text-primary">Console Settings</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Profile Display Name
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent/40"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Default Startup Location
            </label>
            <select
              value={defaultLocId}
              onChange={(e) => setDefaultLocId(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded-lg p-2 text-xs text-text-primary focus:outline-none focus:border-accent/40"
            >
              <option value="">Current Location (GeoIP)</option>
              {savedLocations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              Alert Stream Preferences
            </label>
            <div className="space-y-2 mt-2">
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" defaultChecked className="rounded bg-surface-raised border-border text-accent focus:ring-accent" />
                <span>Simulate severe weather webhooks</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-text-muted">
                <input type="checkbox" defaultChecked className="rounded bg-surface-raised border-border text-accent focus:ring-accent" />
                <span>Notify on cached query refreshes</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-all mt-6"
          >
            Save Configurations
          </button>
        </form>
      </div>
    </div>
  );
}
