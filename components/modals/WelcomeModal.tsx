"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { User, Navigation, Sparkles } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestLocation: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onRequestLocation }: WelcomeModalProps) {
  const { setUserName, showToast } = useSettingsStore();
  const [nameInput, setNameInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      showToast("Please enter a display name to continue.", "warning");
      return;
    }
    
    setUserName(trimmed);
    showToast(`Welcome to Aeris, ${trimmed}!`, "success");
    
    // Request location permissions
    onRequestLocation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-surface/90 border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col gap-6 relative animate-slide-up">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/20 rounded-full filter blur-xl pointer-events-none" />

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <h2 className="font-display text-xl font-extrabold text-text-primary mt-3">
            Welcome to Aeris
          </h2>
          <p className="text-xs text-text-muted max-w-xs mx-auto">
            Your premium, AI-powered real-time weather analytics console.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
              What should we call you?
            </label>
            <div className="flex items-center gap-2.5 bg-surface-raised border border-border rounded-lg px-3 py-2 focus-within:border-accent/40 transition-all">
              <User size={15} className="text-text-muted" />
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name... (e.g. Nikhil)"
                className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none placeholder-text-muted font-sans"
                autoFocus
              />
            </div>
          </div>

          <div className="bg-surface-raised/40 border border-border/80 rounded-lg p-3 text-[10px] text-text-muted flex items-start gap-2.5">
            <Navigation size={14} className="text-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-primary block mb-0.5">Location Access</span>
              We will query your browser Geolocation coordinates to set your active weather station. Denied permissions fallback to IP Lookup detection.
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-accent hover:bg-accent/90 text-bg font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md shadow-accent/15 mt-2"
          >
            Initialize Platform
          </button>
        </form>
      </div>
    </div>
  );
}
