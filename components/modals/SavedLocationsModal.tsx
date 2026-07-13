"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MapPin, X, Plus, Trash2, Pencil, Check } from "lucide-react";

export default function SavedLocationsModal() {
  const { activeModal, setActiveModal, savedLocations, addSavedLocation, removeSavedLocation, showToast } = useAppStore();
  const [name, setName] = useState("");
  const [latInput, setLatInput] = useState("");
  const [lonInput, setLonInput] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Renaming state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

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
    if (editingId === id) {
      setEditingId(null);
    }
    removeSavedLocation(id);
    showToast(`Deleted location "${label}"`, "info");
  };

  const handleStartRename = (id: string, currentLabel: string) => {
    setEditingId(id);
    setEditingName(currentLabel);
  };

  const handleSaveRename = (id: string) => {
    if (!editingName.trim()) {
      showToast("Location name cannot be empty", "danger");
      return;
    }

    const { savedLocations: locations } = useAppStore.getState();
    const updated = locations.map((loc) =>
      loc.id === id ? { ...loc, name: editingName.trim() } : loc
    );
    useAppStore.setState({ savedLocations: updated });
    
    showToast(`Location renamed to "${editingName.trim()}"`, "success");
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div
      onClick={() => {
        setEditingId(null);
        setActiveModal(null);
      }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-slide-in flex flex-col max-h-[550px]"
      >
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
                {editingId === loc.id ? (
                  <div className="flex-1 mr-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="bg-surface border border-accent/40 rounded px-2 py-0.5 text-xs text-text-primary focus:outline-none flex-1"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveRename(loc.id)}
                      className="p-1 rounded text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded text-text-muted hover:bg-surface-raised transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-text-primary block truncate max-w-[200px]">
                        {loc.name}
                      </span>
                      {loc.isDefault && (
                        <span className="text-[8px] text-accent font-bold uppercase tracking-wider">
                          (Default)
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartRename(loc.id, loc.name)}
                        className="p-0.5 text-text-muted hover:text-text-primary transition-colors"
                        title="Rename location"
                      >
                        <Pencil size={11} />
                      </button>
                    </div>
                    <span className="text-[10px] text-text-muted font-mono block">
                      {loc.lat.toFixed(3)}°N, {loc.lon.toFixed(3)}°W
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(loc.id, loc.name)}
                  className="p-1 rounded text-text-muted hover:text-red-500 transition-colors shrink-0"
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
