import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  isLoading?: boolean;
}

export default function ErrorBanner({ message, onRetry, isLoading = false }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 dark:bg-danger/10 dark:text-danger dark:border-danger/20 font-sans">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold tracking-wide uppercase">Request Failed</h4>
        <p className="text-sm mt-1 text-red-600 dark:text-red-400">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isLoading}
            className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
            Retry Request
          </button>
        )}
      </div>
    </div>
  );
}
