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
  indigo: { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", text: "text-indigo-600" },
  emerald: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", text: "text-amber-600" },
  rose: { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", text: "text-rose-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-600" },
  cyan: { bg: "bg-cyan-50", icon: "bg-cyan-100 text-cyan-600", text: "text-cyan-600" },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, trend, color = "indigo", className }) => {
  const c = colors[color];
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4", className)}>
      <div className={cn("p-3 rounded-xl flex-shrink-0", c.icon)}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {trend !== undefined && (
            <span className={cn("flex items-center gap-0.5 text-xs font-medium", trend >= 0 ? "text-emerald-600" : "text-red-500")}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trend)}%
            </span>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
