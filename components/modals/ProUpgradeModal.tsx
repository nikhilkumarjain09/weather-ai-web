"use client";

import React, { useEffect, useState } from "react";
import { Lock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    function handleShowModal() {
      setIsOpen(true);
    }
    window.addEventListener("aeris-show-pro-modal", handleShowModal);
    return () => window.removeEventListener("aeris-show-pro-modal", handleShowModal);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 p-6 relative shadow-2xl flex flex-col items-center text-center gap-5"
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <X size={14} />
          </button>

          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
            <Lock size={20} className="animate-pulse" />
          </div>

          {/* Wording */}
          <div className="space-y-2">
            <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-slate-50">
              Pro Plan Feature
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              This feature is available for Pro Plan users. During the development process, please contact the developer to upgrade.
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white dark:text-bg font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-accent/15"
          >
            Okay
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
