import React from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick, glass = true }) => (
  <div
    className={cn(
      "rounded-2xl",
      glass ? "glass-card" : "bg-white border border-gray-100 shadow-sm",
      onClick && "cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5",
      className
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("px-4 md:px-6 py-4 border-b border-black/5", className)}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("px-4 md:px-6 py-4", className)}>{children}</div>
);
