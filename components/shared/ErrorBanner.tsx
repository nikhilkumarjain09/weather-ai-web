import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
  isLoading?: boolean;
}

export default function ErrorBanner({ message, onRetry, isLoading = false }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 font-sans shadow-lg">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <h4 className="text-sm font-bold tracking-tight">We couldn&apos;t load the weather right now.</h4>
        <p className="text-xs text-red-400">{message || "Please try again in a moment."}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/25 hover:bg-red-500/35 text-red-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
