import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">{label}</label>}
    <div className="relative">
      {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">{icon}</span>}
      <input
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 text-white placeholder-white/30",
          "glass-input border border-white/10 hover:border-white/20",
          icon && "pl-10",
          error ? "border-rose-500/50 focus:ring-rose-500/20" : "focus:border-indigo-500/50 focus:ring-indigo-500/10",
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-rose-400 font-medium mt-0.5">{error}</p>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">{label}</label>}
    <select
      className={cn(
        "w-full px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 text-white bg-transparent cursor-pointer",
        "glass-input border border-white/10 hover:border-white/20",
        error ? "border-rose-500/50" : "focus:border-indigo-500/50 focus:ring-indigo-500/10",
        className
      )}
      {...props}
    >
      {options.map(o => (
        <option key={o.value} value={o.value} className="bg-[#1c1842] text-white">
          {o.label}
        </option>
      ))}
    </select>
    {error && <p className="text-xs text-rose-400 font-medium mt-0.5">{error}</p>}
  </div>
);
