import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  className?: string;
}

const variants = {
  success: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-700 border border-rose-500/20",
  info: "bg-sky-500/10 text-sky-700 border border-sky-500/20",
  neutral: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
  purple: "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20",
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className }) => (
  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase", variants[variant], className)}>
    {children}
  </span>
);
