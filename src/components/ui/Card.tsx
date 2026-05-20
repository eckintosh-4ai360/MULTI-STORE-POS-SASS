import React from "react";
import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => (
  <div
    className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm", onClick && "cursor-pointer hover:shadow-md transition-shadow", className)}
    onClick={onClick}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("px-6 py-4 border-b border-gray-50", className)}>{children}</div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn("px-6 py-4", className)}>{children}</div>
);
