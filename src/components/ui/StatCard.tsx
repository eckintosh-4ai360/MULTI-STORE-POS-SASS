import React from "react";
import { cn } from "../../utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

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
  indigo: { icon: "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" },
  emerald: { icon: "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" },
  amber: { icon: "bg-amber-500 text-white shadow-md shadow-amber-500/20" },
  rose: { icon: "bg-rose-500 text-white shadow-md shadow-rose-500/20" },
  purple: { icon: "bg-purple-500 text-white shadow-md shadow-purple-500/20" },
  cyan: { icon: "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color = "indigo", className }) => {
  const c = colors[color];
  return (
    <div className={cn("glass-stat-card rounded-2xl p-5 flex items-start gap-4 border border-white/60", className)}>
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", c.icon)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {trend !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full", trend >= 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
              {trend >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(trend)}%
            </span>
          )}
          {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};

