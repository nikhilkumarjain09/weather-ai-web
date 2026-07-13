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
    <div className="glass-panel p-5 flex flex-col justify-between font-sans relative overflow-hidden group">
      {/* Absolute faint accent background glow */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/5 rounded-full filter blur-xl group-hover:bg-accent/10 transition-all duration-300" />
      
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-text-muted tracking-widest uppercase font-display">
          {label}
        </span>
        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
          <Icon size={15} />
        </div>
      </div>
      
      <div className="mt-5 space-y-1">
        <span className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary block">
          {value}
        </span>
        <span className="text-[10px] text-text-muted font-medium block leading-snug">
          {caption}
        </span>
      </div>
    </div>
  );
}
