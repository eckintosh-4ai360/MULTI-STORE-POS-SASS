import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  footer?: React.ReactNode;
}

const sizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = "md", footer }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={cn(
        "relative glass-modal rounded-t-3xl sm:rounded-2xl w-full flex flex-col animate-scaleIn",
        "max-h-[95vh] sm:max-h-[90vh]",
        sizes[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-black/8">
          <h3 className="text-base md:text-lg font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100/80 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 md:px-6 py-4">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-5 md:px-6 py-4 border-t border-black/8 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

