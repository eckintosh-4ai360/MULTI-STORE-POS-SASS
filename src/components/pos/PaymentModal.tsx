import React, { useState } from "react";
import { PaymentMethod } from "../../store/posStore";
import { CreditCard, Smartphone, Banknote, CheckCircle, X } from "lucide-react";
import { Button } from "../ui/Button";
import { cn } from "../../utils/cn";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "cash", label: "Cash", icon: <Banknote size={20} /> },
  { id: "mobile_money", label: "Mobile Money", icon: <Smartphone size={20} /> },
  { id: "card", label: "Card", icon: <CreditCard size={20} /> },
];

interface PaymentModalProps {
  total: number;
  onConfirm: (method: PaymentMethod, amountPaid: number) => void;
  onCancel: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ total, onConfirm, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");

  const paid = parseFloat(amountPaid || "0");
  const change = Math.max(0, paid - total);
  const canConfirm = paymentMethod !== "cash" || paid >= total;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(paymentMethod, paid || total);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-modal rounded-3xl w-full max-w-sm overflow-hidden animate-scaleIn">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-gray-800 text-lg">Process Payment</h3>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 transition"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 tracking-tight">
            GHS {total.toFixed(2)}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPaymentMethod(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition text-xs font-semibold",
                  paymentMethod === opt.id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-100"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Cash Amount Input */}
          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
                Amount Received
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder={`GHS ${total.toFixed(2)}`}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-lg font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                autoFocus
              />
              {paid >= total && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center animate-fadeIn">
                  <span className="text-emerald-700 font-bold text-sm">
                    Change: GHS {change.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={!canConfirm}
              onClick={handleConfirm}
              icon={<CheckCircle size={16} />}
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
