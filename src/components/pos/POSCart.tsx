import React from "react";
import { usePOSStore } from "../../store/posStore";
import { ShoppingCart, Minus, Plus, X, Tag, CreditCard, PauseCircle, Users } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";

interface POSCartProps {
  total: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  taxRate: number;
  onCheckout: () => void;
  onHold: () => void;
}

export const POSCart: React.FC<POSCartProps> = ({
  total,
  subtotal,
  taxAmount,
  discountAmount,
  taxRate,
  onCheckout,
  onHold,
}) => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    updateCartItemDiscount,
    clearCart,
    setSelectedCustomer,
    selectedCustomerId,
    cartDiscount,
    setCartDiscount,
    customers,
    currentStoreId,
  } = usePOSStore();

  const storeCustomers = customers.filter((c) => c.storeId === currentStoreId);

  return (
    <div className="w-80 flex flex-col glass-card rounded-3xl flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-indigo-600" />
          <span className="font-bold text-gray-800 text-sm">Cart</span>
          <Badge variant="info">{cart.length}</Badge>
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Customer Selector */}
      <div className="px-4 py-2.5 border-b border-white/20">
        <div className="relative">
          <Users size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={selectedCustomerId ?? ""}
            onChange={(e) => setSelectedCustomer(e.target.value || null)}
            className="w-full text-xs border border-gray-200/80 rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white/60 text-gray-700"
          >
            <option value="">Walk-in Customer</option>
            {storeCustomers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2">
        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-300 animate-fadeIn">
            <ShoppingCart size={40} className="mx-auto mb-2" />
            <p className="text-sm">Cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.productId} className="bg-white/60 border border-white/30 rounded-2xl p-3 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-gray-800 flex-1 leading-snug">
                  {item.productName}
                </p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-gray-300 hover:text-red-400 transition flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateCartQty(item.productId, item.qty - 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <Minus size={10} />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-gray-800">{item.qty}</span>
                  <button
                    onClick={() => updateCartQty(item.productId, item.qty + 1)}
                    className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
                  >
                    <Plus size={10} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">
                    GH₵ {(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 justify-end">
                    <Tag size={9} className="text-gray-300" />
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) =>
                        updateCartItemDiscount(item.productId, parseFloat(e.target.value) || 0)
                      }
                      className="w-10 text-[10px] text-center border border-gray-200 rounded bg-white/80 focus:outline-none"
                      min="0"
                      max="100"
                    />
                    <span className="text-[10px] text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Totals */}
      {cart.length > 0 && (
        <div className="border-t border-white/30 px-4 py-3 space-y-1.5 bg-white/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 flex-1">Order Discount</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={cartDiscount}
                onChange={(e) => setCartDiscount(parseFloat(e.target.value) || 0)}
                className="w-12 text-xs text-center border border-gray-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white/80"
                min="0"
                max="100"
              />
              <span className="text-xs text-gray-400">%</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span>
            <span>GH₵ {subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-red-500">
              <span>Discount</span>
              <span>-GH₵ {discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Tax ({taxRate}%)</span>
            <span>GH₵ {taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-800 text-sm pt-1.5 border-t border-white/30">
            <span>Total</span>
            <span>GH₵ {total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 pb-4 pt-2 space-y-2 bg-white/30">
        {cart.length > 0 && (
          <>
            <button
              onClick={onHold}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-amber-300 text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-50 transition active:scale-[0.98]"
            >
              <PauseCircle size={16} /> Hold Sale
            </button>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <CreditCard size={18} /> Charge GH₵ {total.toFixed(2)}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
