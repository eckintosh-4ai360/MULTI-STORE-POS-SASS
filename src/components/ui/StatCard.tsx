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
  indigo: { iconBg: "bg-indigo-500/10 text-indigo-600" },
  emerald: { iconBg: "bg-emerald-500/10 text-emerald-600" },
  amber: { iconBg: "bg-amber-500/10 text-amber-600" },
  rose: { iconBg: "bg-rose-500/10 text-rose-600" },
  purple: { iconBg: "bg-purple-500/10 text-purple-600" },
  cyan: { iconBg: "bg-cyan-500/10 text-cyan-600" },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color = "indigo", className }) => {
  const c = colors[color] || colors.indigo;
  return (
    <div className={cn("glass-card rounded-2xl p-5 flex flex-col justify-between border border-white/60 shadow-sm relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md", className)}>
      {/* Top row: Icon and Badge/Trend */}
      <div className="flex items-center justify-between mb-3 w-full">
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-inner", c.iconBg)}>
          {icon}
        </div>
        {trend !== undefined ? (
          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", 
            trend >= 0 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
              : "bg-rose-50 text-rose-600 border-rose-100"
          )}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {color === "indigo" ? "LIVE" : color === "emerald" ? "ACTIVE" : color === "amber" ? "PENDING" : "TODAY"}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-1">
        <span className="text-3xl font-black text-slate-900 tracking-tight block">{value}</span>
      </div>

      {/* Text Info */}
      <div className="mt-2">
        <span className="text-xs font-bold text-slate-800 block leading-tight">{title}</span>
        {subtitle && <span className="text-[10px] font-medium text-slate-500 block mt-1">{subtitle}</span>}
      </div>
    </div>
  );
};

