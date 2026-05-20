import React from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success" | "warning";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants = {
  primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
  secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  danger: "bg-red-500 hover:bg-red-600 text-white shadow-sm",
  ghost: "hover:bg-gray-100 text-gray-600",
  success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm",
  warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm",
};

const sizes = {
  xs: "px-2 py-1 text-xs rounded-lg",
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
};

export const Button: React.FC<ButtonProps> = ({
  children, variant = "primary", size = "md", loading, icon, className, disabled, ...props
}) => (
  <button
    disabled={disabled || loading}
    className={cn(
      "inline-flex items-center gap-2 font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
      variants[variant], sizes[size], className
    )}
    {...props}
  >
    {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : icon}
    {children}
  </button>
);
