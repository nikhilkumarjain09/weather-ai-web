"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { User, Navigation, Sparkles, Thermometer, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestLocation: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onRequestLocation }: WelcomeModalProps) {
  const { setUserName, showToast } = useSettingsStore();
  const { unit, setUnit } = usePreferencesStore();

  const [step, setStep] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const [tempUnit, setTempUnit] = useState<"C" | "F">(unit);
  const [enableAi, setEnableAi] = useState(true);

  if (!isOpen) return null;

  const handleNextStep = () => {
    if (step === 1) {
      if (!nameInput.trim()) {
        showToast("Please enter a display name to proceed.", "warning");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleFinish = () => {
    // Save configurations
    setUserName(nameInput.trim());
    setUnit(tempUnit);
    localStorage.setItem("aeris-ai-enabled", JSON.stringify(enableAi));
    
    showToast(`Aeris initialized. Welcome, ${nameInput.trim()}!`, "success");
    onRequestLocation();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 font-sans">
      <div className="glass-panel w-full max-w-md overflow-hidden p-6 md:p-8 flex flex-col gap-6 relative border-white/10 bg-slate-950/80">
        
        {/* Glow corner blobs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full filter blur-[60px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full filter blur-[60px]" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto">
                  <Sparkles size={20} className="animate-pulse" />
                </div>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  Welcome to Aeris Weather
                </h2>
                <p className="text-[11px] text-text-muted max-w-xs mx-auto font-medium">
                  A premium commercial platform for real-time weather analytics.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  What should we call you?
                </label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-accent/40 transition-all">
                  <User size={15} className="text-text-muted" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter name (e.g. Nikhil)"
                    className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none placeholder-text-muted font-sans font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-accent/15"
              >
                Continue Installation
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto">
                  <Thermometer size={20} />
                </div>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  Customize Experience
                </h2>
                <p className="text-[11px] text-text-muted font-medium">
                  Configure your preferred meteorology parameters.
                </p>
              </div>

              <div className="space-y-4">
                {/* Temperature unit */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                    Temperature scale
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setTempUnit("C")}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        tempUnit === "C"
                          ? "bg-accent/10 border-accent text-accent"
                          : "bg-white/5 border-white/10 text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      onClick={() => setTempUnit("F")}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        tempUnit === "F"
                          ? "bg-accent/10 border-accent text-accent"
                          : "bg-white/5 border-white/10 text-text-muted hover:text-text-primary"
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>

                {/* AI Summary toggle */}
                <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="space-y-0.5 pr-2">
                    <span className="text-[11px] font-bold text-text-primary block">Enable WeatherAI Summary</span>
                    <span className="text-[9px] text-text-muted block leading-snug">
                      Allows real-time meteorological reports and lifestyle advice synthesis.
                    </span>
                  </div>
                  <button
                    onClick={() => setEnableAi(!enableAi)}
                    className={`w-10 h-6 rounded-full p-0.5 transition-all ${
                      enableAi ? "bg-accent" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-all transform ${
                        enableAi ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-accent/15"
              >
                Next Step
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mx-auto">
                  <Navigation size={20} />
                </div>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  Location Services
                </h2>
                <p className="text-[11px] text-text-muted font-medium">
                  Set up location focus coordinates.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] text-text-muted flex items-start gap-3">
                <Navigation size={15} className="text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-text-primary block">Browser Geolocation Tracking</span>
                  <p className="leading-relaxed">
                    Aeris requires coordinate telemetry to render localized stats. Denying access will trigger a fallback query using your client IP address.
                  </p>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-accent/15 flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                Complete Setup
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
