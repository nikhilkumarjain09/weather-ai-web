import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  icon: LucideIcon;
  value: string | number;
  caption: string;
}

export default function StatCard({ label, icon: Icon, value, caption }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-[10px] p-4 flex flex-col font-sans relative overflow-hidden transition-all hover:bg-surface-raised/40">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase">
          {label}
        </span>
        <div className="w-7 h-7 rounded-full bg-surface-raised border border-border flex items-center justify-center text-text-muted">
          <Icon size={14} />
        </div>
      </div>
      <div className="mt-3">
        <span className="font-mono text-xl md:text-2xl font-bold tracking-tight text-text-primary">
          {value}
        </span>
      </div>
      <div className="mt-1">
        <span className="text-[11px] text-text-muted font-medium">
          {caption}
        </span>
      </div>
    </div>
  );
}
