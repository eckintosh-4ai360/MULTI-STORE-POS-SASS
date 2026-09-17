import React from "react";
import { cn } from "../../utils/cn";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  color?: "indigo" | "emerald" | "amber" | "rose" | "purple" | "cyan";
  className?: string;
}

const colors = {
  indigo: { accent: "#4f46e5", soft: "#eef2ff", track: "#e0e7ff" },
  emerald: { accent: "#10b981", soft: "#ecfdf5", track: "#d1fae5" },
  amber: { accent: "#f59e0b", soft: "#fffbeb", track: "#fef3c7" },
  rose: { accent: "#f43f5e", soft: "#fff1f2", track: "#ffe4e6" },
  purple: { accent: "#7c3aed", soft: "#f5f3ff", track: "#ede9fe" },
  cyan: { accent: "#0891b2", soft: "#ecfeff", track: "#cffafe" },
};

const ProgressRing: React.FC<{ value?: number; accent: string; track: string }> = ({ value, accent, track }) => {
  const displayValue = Math.min(Math.abs(value ?? 0), 100);
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayValue / 100) * circumference;

  return (
    <div className="relative grid h-12 w-12 place-items-center">
      <svg className="absolute -rotate-90" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={radius} fill="none" stroke={track} strokeWidth="4" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <span className="relative text-[10px] font-extrabold tracking-tight text-slate-700">
        {value === undefined ? "—" : `${value > 0 ? "+" : ""}${value}%`}
      </span>
    </div>
  );
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color = "indigo", className }) => {
  const palette = colors[color] || colors.indigo;

  return (
    <section className={cn("group relative min-h-48 overflow-hidden rounded-[28px] border border-white/90 bg-white/85 p-5 shadow-[0_14px_32px_rgba(73,78,163,0.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(73,78,163,0.16)]", className)}>
      <div className="absolute -right-5 top-9 h-28 w-8 rounded-l-[22px] opacity-95 transition-transform duration-300 group-hover:-translate-x-1" style={{ backgroundColor: palette.accent }} />
      <div className="absolute -right-12 bottom-[-54px] h-28 w-28 rounded-full opacity-40" style={{ backgroundColor: palette.soft }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white shadow-sm" style={{ backgroundColor: palette.soft, color: palette.accent }}>
          {icon}
        </div>
        <ProgressRing value={trend} accent={palette.accent} track={palette.track} />
      </div>
      <div className="relative mt-6">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-1.5 text-[28px] font-black leading-none tracking-[-0.045em] text-slate-950">{value}</p>
        {subtitle && <p className="mt-3 text-xs font-medium text-slate-400">{subtitle}</p>}
      </div>
    </section>
  );
};
