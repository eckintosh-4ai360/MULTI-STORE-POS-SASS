import React from "react";
import { cn } from "../../utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral" | "purple";
  className?: string;
}

const variants = {
  success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border border-amber-200",
  danger: "bg-red-100 text-red-700 border border-red-200",
  info: "bg-blue-100 text-blue-700 border border-blue-200",
  neutral: "bg-gray-100 text-gray-600 border border-gray-200",
  purple: "bg-purple-100 text-purple-700 border border-purple-200",
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = "neutral", className }) => (
  <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
    {children}
  </span>
);
