"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MapPin, X, Plus, Trash2 } from "lucide-react";

export default function SavedLocationsModal() {
  const { activeModal, setActiveModal, savedLocations, addSavedLocation, removeSavedLocation, showToast } = useAppStore();
  const [name, setName] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const isOpen = activeModal === "saved_locations";

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(latInput);
    const lon = parseFloat(lonInput);

    if (isNaN(lat) || isNaN(lon)) {
      showToast("Invalid latitude or longitude", "danger");
      return;
    }

    addSavedLocation({
      name: name.trim(),
      lat,
      lon,
      isDefault,
    });

    showToast(`Location "${name.trim()}" saved`, "success");
    setName("");
    setLatInput("");
    setLonInput("");
    setIsDefault(false);
  };

  const handleRemove = (id: string, label: string) => {
    removeSavedLocation(id);
    showToast(`Deleted location "${label}"`, "info");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-slide-in flex flex-col max-h-[500px]">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-accent" size={20} />
          <h2 className="font-display text-base font-bold text-text-primary">Saved Locations Management</h2>
        </div>

        {/* Existing Locations */}
        <div className="flex-1 overflow-y-auto mb-4 border border-border rounded-lg bg-surface-raised p-2 max-h-48 divide-y divide-border">
          {savedLocations.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No saved locations.</p>
          ) : (
            savedLocations.map((loc) => (
              <div key={loc.id} className="flex items-center justify-between py-2 px-1 text-xs">
                <div>
                  <span className="font-semibold text-text-primary block">
                    {loc.name} {loc.isDefault && <span className="text-[9px] text-accent font-bold uppercase">(Default)</span>}
                  </span>
                  <span className="text-[10px] text-text-muted font-mono">
                    {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°W
                  </span>
                </div>
                <button
                  onClick={() => handleRemove(loc.id, loc.name)}
                  className="p-1 rounded text-text-muted hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="border-t border-border pt-4 space-y-3">
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wide">Register New Node</h3>
          
          <div>
            <label className="block text-[9px] font-bold text-text-muted uppercase mb-1">Location Label</label>
            <input
              type="text"
              placeholder="e.g. Paris Office"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-raised border border-border rounded p-1.5 text-xs text-text-primary focus:outline-none focus:border-accent/40"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-bold text-text-muted uppercase mb-1">Latitude</label>
              <input
                type="text"
                placeholder="48.856"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded p-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent/40"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-text-muted uppercase mb-1">Longitude</label>
              <input
                type="text"
                placeholder="2.352"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className="w-full bg-surface-raised border border-border rounded p-1.5 text-xs text-text-primary font-mono focus:outline-none focus:border-accent/40"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="set-default"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded bg-surface-raised border-border text-accent focus:ring-accent"
            />
            <label htmlFor="set-default" className="text-[11px] font-semibold text-text-muted select-none cursor-pointer">
              Set as startup default location
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-all flex items-center justify-center gap-1"
          >
            <Plus size={12} />
            Save Node
          </button>
        </form>
      </div>
    </div>
  );
}
