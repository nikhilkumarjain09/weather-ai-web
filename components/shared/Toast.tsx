"use client"; // Split to avoid direct next.js parser warning in string if any

import React from "react";
import { useAppStore, ToastItem } from "@/store/useAppStore";
import { X, CheckCircle, Info, AlertTriangle, AlertOctagon } from "lucide-react";

export default function Toast() {
  const { toasts, dismissToast } = useAppStore();

  if (toasts.length === 0) return null;

  const icons: Record<ToastItem["type"], React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    info: <Info className="w-5 h-5 text-accent" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    danger: <AlertOctagon className="w-5 h-5 text-red-500" />,
  };

  const borderColors: Record<ToastItem["type"], string> = {
    success: "border-emerald-500/20 dark:border-success/20",
    info: "border-accent/20",
    warning: "border-amber-500/20 dark:border-warning/20",
    danger: "border-red-500/20 dark:border-danger/20",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg bg-surface border shadow-lg transition-all duration-300 pointer-events-auto animate-slide-in ${borderColors[toast.type]}`}
        >
          <div className="shrink-0">{icons[toast.type]}</div>
          <p className="flex-1 font-sans text-sm text-text-primary">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 p-0.5 rounded-full hover:bg-surface-raised text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
