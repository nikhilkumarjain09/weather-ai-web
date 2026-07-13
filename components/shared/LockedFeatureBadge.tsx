import React from "react";
import { Lock } from "lucide-react";

interface LockedFeatureBadgeProps {
  className?: string;
}

export default function LockedFeatureBadge({ className = "" }: LockedFeatureBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 dark:bg-warning/10 dark:text-warning dark:border-warning/20 ${className}`}
    >
      <Lock size={10} className="shrink-0" />
      PRO ONLY
    </span>
  );
}
