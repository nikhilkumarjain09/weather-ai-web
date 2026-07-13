"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { User, Send } from "lucide-react";

export default function NamePromptModal() {
  const { userName, setUserName, showToast, activeModal, setActiveModal } = useAppStore();
  const [nameInput, setNameInput] = useState("");

  const isOpen = userName === null || activeModal === "name_prompt";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setUserName(nameInput.trim());
    showToast(`Identity initialized: welcome ${nameInput.trim()}`, "success");
    
    if (activeModal === "name_prompt") {
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0A0E16]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-sm w-full p-6 text-center animate-slide-in">
        <div className="w-12 h-12 rounded-full bg-accent-tint/30 border border-accent/20 flex items-center justify-center text-accent mx-auto mb-4">
          <User size={22} />
        </div>

        <h2 className="font-display text-xl font-bold text-text-primary mb-2">Identify Terminal Node</h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          Please initialize a display name to register your session with the Aeris weather terminal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter name or node identifier..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full bg-surface-raised border border-border rounded-lg px-3 py-2 text-xs text-text-primary text-center focus:outline-none focus:border-accent/40 placeholder-text-muted"
            autoFocus
            maxLength={25}
            required
          />

          <button
            type="submit"
            className="w-full py-2 rounded-lg text-xs font-semibold bg-accent hover:bg-accent/90 text-bg transition-all flex items-center justify-center gap-1.5"
          >
            <Send size={12} />
            Initialize Console
          </button>
        </form>
      </div>
    </div>
  );
}
