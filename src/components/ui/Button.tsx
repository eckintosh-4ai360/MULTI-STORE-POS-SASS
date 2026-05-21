import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "warning";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: "glass-button-primary text-white",
  secondary: "bg-gray-100/90 hover:bg-gray-200/90 text-gray-700 border border-gray-200/80",
  danger: "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white shadow-md shadow-red-500/25 border border-red-400/20",
  ghost: "hover:bg-gray-100/80 text-gray-600 border border-transparent hover:border-gray-200/60",
  success: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/25 border border-emerald-400/20",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/25 border border-amber-400/20",
};

const sizes = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1",
  sm: "px-3 py-1.5 text-sm rounded-xl gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-2xl gap-2",
};

export const Button: React.FC<ButtonProps> = ({
  children, variant = "primary", size = "md", loading, icon, className, disabled, ...props
}) => (
  <button
    disabled={disabled || loading}
    className={cn(
      "inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
      variants[variant], sizes[size], className
    )}
    {...props}
  >
    {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
    {children}
  </button>
);
