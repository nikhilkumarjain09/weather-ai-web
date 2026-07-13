import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isLoading = false,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-lg bg-surface border-border min-h-[300px]">
      <div className="p-3 bg-surface-raised border border-border rounded-full text-text-muted mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display text-lg font-bold text-text-primary mb-1">{title}</h3>
      <p className="font-sans text-sm text-text-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-semibold rounded bg-accent hover:bg-accent/90 text-bg transition-colors disabled:opacity-50"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
