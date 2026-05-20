import React, { useState, useMemo } from "react";
import { usePOSStore, PaymentMethod, Sale } from "../store/posStore";
import { Search, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote, ShoppingCart, Tag, PauseCircle, PlayCircle, Printer, CheckCircle, X } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { format } from "date-fns";
import { cn } from "../utils/cn";

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "cash", label: "Cash", icon: <Banknote size={18} /> },
  { id: "mobile_money", label: "Mobile Money", icon: <Smartphone size={18} /> },
  { id: "card", label: "Card", icon: <CreditCard size={18} /> },
];

const ReceiptModal: React.FC<{ sale: Sale; onClose: () => void }> = ({ sale, onClose }) => {
  const { stores } = usePOSStore();
  const store = stores.find(s => s.id === sale.storeId);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center border-b">
          <CheckCircle size={40} className="text-green-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-800 text-lg">Sale Complete!</h3>
          <p className="text-gray-500 text-sm">Change: GHS {sale.change.toFixed(2)}</p>
        </div>
        <div className="p-6 font-mono text-xs space-y-1 bg-gray-50 rounded-b-none">
          <p className="text-center font-bold text-sm">{store?.name}</p>
          <p className="text-center text-gray-500">{store?.location}</p>
          <p className="text-center text-gray-400">{store?.receiptHeader}</p>
          <div className="border-t border-dashed my-2" />
          <div className="flex justify-between"><span>{format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}</span><span>{sale.invoiceNo}</span></div>
          {sale.customerName && <p>Customer: {sale.customerName}</p>}
          <div className="border-t border-dashed my-2" />
          {sale.items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <span className="flex-1">{item.productName} x{item.qty}{item.discount > 0 ? ` (-${item.discount}%)` : ""}</span>
              <span>GHS {(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-dashed my-2" />
          <div className="flex justify-between"><span>Subtotal</span><span>GHS {sale.subtotal.toFixed(2)}</span></div>
          {sale.discountAmount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>-GHS {sale.discountAmount.toFixed(2)}</span></div>}
          <div className="flex justify-between"><span>Tax ({store?.taxRate}%)</span><span>GHS {sale.taxAmount.toFixed(2)}</span></div>
          <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>GHS {sale.total.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Paid ({sale.paymentMethod.replace("_", " ")})</span><span>GHS {sale.amountPaid.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Change</span><span>GHS {sale.change.toFixed(2)}</span></div>
          <div className="border-t border-dashed my-2" />
          <p className="text-center">{store?.receiptFooter}</p>
        </div>
        <div className="p-4 flex gap-2">
          <Button variant="secondary" className="flex-1" icon={<Printer size={16} />} onClick={() => window.print()}>Print</Button>
          <Button className="flex-1" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
};

export const POSPage: React.FC = () => {
  const {
    products, cart, addToCart, removeFromCart, updateCartQty, updateCartItemDiscount,
    clearCart, holdSale, resumeHeldSale, deleteHeldSale, heldSales, completeSale,
    customers, selectedCustomerId, setSelectedCustomer, cartDiscount, setCartDiscount,
    currentStoreId, stores
  } = usePOSStore();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showHeld, setShowHeld] = useState(false);

  const store = stores.find(s => s.id === currentStoreId);
  const taxRate = store?.taxRate ?? 15;

  const storeProducts = useMemo(() =>
    products.filter(p => p.storeId === currentStoreId && p.stock > 0),
    [products, currentStoreId]
  );

  const categories = useMemo(() => {
    const cats = [...new Set(storeProducts.map(p => p.categoryId))];
    return cats;
  }, [storeProducts]);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
      const matchCat = selectedCategory === "all" || p.categoryId === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [storeProducts, search, selectedCategory]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty * (1 - item.discount / 100), 0);
  const discountAmount = subtotal * (cartDiscount / 100);
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  const change = Math.max(0, parseFloat(amountPaid || "0") - total);

  const storeCustomers = customers.filter(c => c.storeId === currentStoreId);

  const handleComplete = () => {
    const paid = parseFloat(amountPaid || "0");
    if (paymentMethod === "cash" && paid < total) return;
    const sale = completeSale(paymentMethod, paid || total);
    if (sale) {
      setCompletedSale(sale);
      setShowPayment(false);
      setAmountPaid("");
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Product Grid */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search product or scan barcode..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={() => setShowHeld(true)} className="relative p-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
              <PauseCircle size={18} className="text-amber-500" />
              {heldSales.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{heldSales.length}</span>}
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition", selectedCategory === "all" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
          >
            All Products
          </button>
          {categories.map(catId => {
            const catProducts = storeProducts.filter(p => p.categoryId === catId);
            return (
              <button
                key={catId}
                onClick={() => setSelectedCategory(catId)}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition", selectedCategory === catId ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
              >
                {catProducts[0]?.name.split(" ")[0] ?? catId} ({catProducts.length})
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const inCart = cart.find(c => c.productId === product.id);
              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={cn(
                    "bg-white rounded-2xl border p-3 text-left transition hover:shadow-md hover:border-indigo-300 active:scale-95",
                    inCart ? "border-indigo-300 ring-2 ring-indigo-100" : "border-gray-100"
                  )}
                >
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl mb-2 flex items-center justify-center text-3xl">
                    {product.name.startsWith("Coca") ? "🥤" :
                      product.name.startsWith("Pepsi") ? "🫙" :
                      product.name.startsWith("Pringles") ? "🥫" :
                      product.name.startsWith("Samsung") ? "📱" :
                      product.name.includes("Earbuds") ? "🎧" :
                      product.name.includes("Cable") ? "🔌" :
                      product.name.includes("Shirt") ? "👕" :
                      product.name.includes("Dress") ? "👗" :
                      product.name.includes("Bag") ? "🎒" :
                      product.name.includes("Ice") ? "🍦" :
                      product.name.includes("Biscuit") ? "🍪" :
                      product.name.includes("Shampoo") || product.name.includes("Shoulders") ? "🧴" : "📦"}
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                  <p className="text-sm font-bold text-indigo-600 mt-0.5">GHS {product.price.toFixed(2)}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={cn("text-[10px]", product.stock <= product.lowStockThreshold ? "text-amber-500" : "text-gray-400")}>
                      {product.stock} in stock
                    </span>
                    {inCart && <Badge variant="info">{inCart.qty}</Badge>}
                  </div>
                </button>
              );
            })}
          </div>
          {!filteredProducts.length && (
            <div className="text-center py-16 text-gray-400">
              <Search size={40} className="mx-auto mb-2 opacity-40" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm flex-shrink-0">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-indigo-600" />
            <span className="font-semibold text-gray-800">Cart</span>
            <Badge variant="info">{cart.length}</Badge>
          </div>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 transition">Clear</button>
          )}
        </div>

        {/* Customer */}
        <div className="px-4 py-2 border-b border-gray-50">
          <select
            value={selectedCustomerId ?? ""}
            onChange={e => setSelectedCustomer(e.target.value || null)}
            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            <option value="">👤 Walk-in Customer</option>
            {storeCustomers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          {cart.map(item => (
            <div key={item.productId} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-gray-800 flex-1 leading-tight">{item.productName}</p>
                <button onClick={() => removeFromCart(item.productId)} className="text-gray-300 hover:text-red-400 transition flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1">
                  <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
                    <Minus size={10} />
                  </button>
                  <span className="w-7 text-center text-xs font-bold">{item.qty}</span>
                  <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition">
                    <Plus size={10} />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-800">GHS {(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Tag size={9} className="text-gray-300" />
                    <input
                      type="number"
                      value={item.discount}
                      onChange={e => updateCartItemDiscount(item.productId, parseFloat(e.target.value) || 0)}
                      className="w-10 text-[10px] text-center border border-gray-200 rounded bg-white focus:outline-none"
                      min="0" max="100"
                    />
                    <span className="text-[10px] text-gray-400">%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!cart.length && (
            <div className="text-center py-12 text-gray-300">
              <ShoppingCart size={36} className="mx-auto mb-2" />
              <p className="text-sm">Cart is empty</p>
            </div>
          )}
        </div>

        {/* Totals */}
        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 flex-1">Order Discount</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={cartDiscount}
                  onChange={e => setCartDiscount(parseFloat(e.target.value) || 0)}
                  className="w-12 text-xs text-center border border-gray-200 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  min="0" max="100"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500"><span>Subtotal</span><span>GHS {subtotal.toFixed(2)}</span></div>
            {discountAmount > 0 && <div className="flex justify-between text-xs text-red-500"><span>Discount</span><span>-GHS {discountAmount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-xs text-gray-500"><span>Tax ({taxRate}%)</span><span>GHS {taxAmount.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-gray-800 text-sm pt-1 border-t border-gray-100"><span>Total</span><span>GHS {total.toFixed(2)}</span></div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 pb-4 space-y-2">
          {cart.length > 0 && (
            <>
              <button
                onClick={() => holdSale()}
                className="w-full flex items-center justify-center gap-2 py-2 border border-amber-300 text-amber-600 rounded-xl text-sm font-medium hover:bg-amber-50 transition"
              >
                <PauseCircle size={16} /> Hold Sale
              </button>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Charge GHS {total.toFixed(2)}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 border-b">
              <h3 className="font-bold text-gray-800 text-lg">Process Payment</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-1">GHS {total.toFixed(2)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition text-xs font-medium",
                      paymentMethod === opt.id ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
              {paymentMethod === "cash" && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Amount Received</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    placeholder={`GHS ${total.toFixed(2)}`}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg font-bold"
                    autoFocus
                  />
                  {parseFloat(amountPaid || "0") >= total && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
                      <span className="text-green-700 font-semibold text-sm">Change: GHS {change.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShowPayment(false)}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={paymentMethod === "cash" && parseFloat(amountPaid || "0") < total}
                  onClick={handleComplete}
                  icon={<CheckCircle size={16} />}
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Held Sales Modal */}
      {showHeld && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-bold text-gray-800">Held Sales</h3>
              <button onClick={() => setShowHeld(false)} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {heldSales.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-700">{h.items.length} item(s)</p>
                    {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                    <p className="text-[10px] text-gray-400">{format(new Date(h.heldAt), "HH:mm")}</p>
                  </div>
                  <button onClick={() => { resumeHeldSale(h.id); setShowHeld(false); }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg transition"><PlayCircle size={18} /></button>
                  <button onClick={() => deleteHeldSale(h.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                </div>
              ))}
              {!heldSales.length && <p className="text-center py-8 text-gray-400 text-sm">No held sales</p>}
            </div>
          </div>
        </div>
      )}

      {/* Receipt */}
      {completedSale && <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />}
    </div>
  );
};
