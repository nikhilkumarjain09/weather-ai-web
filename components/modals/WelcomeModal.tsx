"use client";

import React, { useState } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { usePreferencesStore } from "@/store/preferencesStore";
import { Smile } from "lucide-react";
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
    if (step === 2) {
      if (!nameInput.trim()) {
        showToast("Please type your name to continue.", "warning");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleAllowLocation = () => {
    onRequestLocation();
    handleNextStep();
  };

  const handleSkipLocation = () => {
    showToast("No problem! You can set your city manually later.", "info");
    handleNextStep();
  };

  const handleFinish = () => {
    // Save configurations to global stores
    setUserName(nameInput.trim());
    setUnit(tempUnit);
    localStorage.setItem("aeris-ai-enabled", JSON.stringify(enableAi));
    
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
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="text-3xl block">👋</span>
                <h2 className="font-display text-2xl font-extrabold text-text-primary tracking-tight">
                  Welcome
                </h2>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  We&apos;re happy you&apos;re here. Let&apos;s set things up in less than a minute.
                </p>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent/15"
              >
                Get Started
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
              <div className="space-y-2 text-center">
                <span className="text-3xl block">😊</span>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  What should we call you?
                </h2>
                <p className="text-[11px] text-text-muted font-medium">
                  This helps us personalize your weather experience.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-accent/40 transition-all">
                  <Smile size={15} className="text-text-muted" />
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Type your name"
                    className="flex-1 bg-transparent text-xs text-text-primary focus:outline-none placeholder-text-muted font-sans font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
              >
                Continue
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="text-3xl block">📍</span>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  Can we use your location?
                </h2>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  This helps us show the weather where you are. You can always change this later.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleAllowLocation}
                  className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent/15"
                >
                  Allow Location
                </button>
                <button
                  onClick={handleSkipLocation}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                >
                  Not Now
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <span className="text-3xl block">🌡️</span>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  How would you like to see the temperature?
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setTempUnit("C");
                    setStep(5);
                  }}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    tempUnit === "C"
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-white/5 border-white/10 text-text-muted hover:text-text-primary"
                  }`}
                >
                  Celsius (°C)
                </button>
                <button
                  onClick={() => {
                    setTempUnit("F");
                    setStep(5);
                  }}
                  className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                    tempUnit === "F"
                      ? "bg-accent/15 border-accent text-accent"
                      : "bg-white/5 border-white/10 text-text-muted hover:text-text-primary"
                  }`}
                >
                  Fahrenheit (°F)
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <span className="text-3xl block">✨</span>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  Want daily weather tips?
                </h2>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  We&apos;ll show simple recommendations based on today&apos;s weather.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEnableAi(true);
                    setStep(6);
                  }}
                  className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent/15"
                >
                  Yes, show tips
                </button>
                <button
                  onClick={() => {
                    setEnableAi(false);
                    setStep(6);
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-text-muted hover:text-text-primary font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300"
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: -20 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <span className="text-3xl block">🎉</span>
                <h2 className="font-display text-xl font-extrabold text-text-primary tracking-tight">
                  You&apos;re all set!
                </h2>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  Let&apos;s check today&apos;s weather.
                </p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 bg-accent hover:bg-accent/90 text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-accent/15"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
