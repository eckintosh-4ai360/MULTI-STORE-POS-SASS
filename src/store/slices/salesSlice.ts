import { StateCreator } from "zustand";
import {
  POSState,
  CartItem,
  HeldSale,
  Sale,
  SaleItem,
  InventoryLog,
  PaymentMethod,
  StockMoveType,
} from "../posStore";

export interface SalesSlice {
  sales: Sale[];
  heldSales: HeldSale[];
  cart: CartItem[];
  selectedCustomerId: string | null;
  cartDiscount: number;
  addToCart: (product: { id: string; name: string; price: number; stock: number }) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  updateCartItemDiscount: (productId: string, discount: number) => void;
  setCartDiscount: (discount: number) => void;
  setSelectedCustomer: (customerId: string | null) => void;
  clearCart: () => void;
  holdSale: (note?: string) => Promise<void>;
  resumeHeldSale: (id: string) => Promise<void>;
  deleteHeldSale: (id: string) => Promise<void>;
  completeSale: (paymentMethod: PaymentMethod, amountPaid: number) => Promise<Sale | null>;
}

export const createSalesSlice: StateCreator<POSState, [], [], SalesSlice> = (set, get) => ({
  sales: [],
  heldSales: [],
  cart: [],
  selectedCustomerId: null,
  cartDiscount: 0,

  addToCart: (product) => {
    set((s) => {
      const existing = s.cart.find((c) => c.productId === product.id);
      if (existing) {
        return {
          cart: s.cart.map((c) =>
            c.productId === product.id
              ? { ...c, qty: Math.min(c.qty + 1, product.stock) }
              : c
          ),
        };
      }
      return {
        cart: [
          ...s.cart,
          {
            productId: product.id,
            productName: product.name,
            price: product.price,
            qty: 1,
            discount: 0,
            stock: product.stock,
          },
        ],
      };
    });
  },

  removeFromCart: (productId) =>
    set((s) => ({ cart: s.cart.filter((c) => c.productId !== productId) })),

  updateCartQty: (productId, qty) =>
    set((s) => ({
      cart: s.cart.map((c) =>
        c.productId === productId ? { ...c, qty: Math.max(1, Math.min(qty, c.stock)) } : c
      ),
    })),

  updateCartItemDiscount: (productId, discount) =>
    set((s) => ({
      cart: s.cart.map((c) =>
        c.productId === productId
          ? { ...c, discount: Math.max(0, Math.min(discount, 100)) }
          : c
      ),
    })),

  setCartDiscount: (discount) =>
    set({ cartDiscount: Math.max(0, Math.min(discount, 100)) }),

  setSelectedCustomer: (customerId) => set({ selectedCustomerId: customerId }),

  clearCart: () => set({ cart: [], selectedCustomerId: null, cartDiscount: 0 }),

  holdSale: async (note) => {
    const { cart, selectedCustomerId } = get();
    if (!cart.length) return;
    const held: HeldSale = {
      id: `held_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      items: cart,
      customerId: selectedCustomerId ?? undefined,
      note,
      heldAt: new Date().toISOString(),
    };
    // Optimistic update
    set((s) => ({
      heldSales: [...s.heldSales, held],
      cart: [],
      selectedCustomerId: null,
      cartDiscount: 0,
    }));
    // Sync to DB
    try {
      await fetch("/api/held-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(held),
      });
    } catch (err) {
      console.error("Error syncing held sale to DB:", err);
    }
  },

  resumeHeldSale: async (id) => {
    const held = get().heldSales.find((h) => h.id === id);
    if (!held) return;
    set((s) => ({
      cart: held.items,
      selectedCustomerId: held.customerId ?? null,
      heldSales: s.heldSales.filter((h) => h.id !== id),
    }));
    // Delete from DB
    try {
      await fetch(`/api/held-sales?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting held sale from DB:", err);
    }
  },

  deleteHeldSale: async (id) => {
    set((s) => ({ heldSales: s.heldSales.filter((h) => h.id !== id) }));
    try {
      await fetch(`/api/held-sales?id=${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting held sale from DB:", err);
    }
  },

  completeSale: async (paymentMethod, amountPaid) => {
    const { cart, currentStoreId, currentUser, selectedCustomerId, customers, cartDiscount, stores } =
      get();
    if (!cart.length || !currentStoreId || !currentUser) return null;

    const store = stores.find((s) => s.id === currentStoreId);
    const taxRate = store?.taxRate ?? 15;
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.qty * (1 - item.discount / 100),
      0
    );
    const discountAmount = subtotal * (cartDiscount / 100);
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = parseFloat((afterDiscount + taxAmount).toFixed(2));
    const storeAbbr = currentStoreId.toUpperCase();
    const invoiceNo = `INV-${storeAbbr}-${Date.now().toString().slice(-6)}`;
    const customer = selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)
      : null;

    const saleData = {
      invoiceNo,
      items: cart.map((c) => ({
        productId: c.productId,
        productName: c.productName,
        qty: c.qty,
        price: c.price,
        discount: c.discount,
      })),
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      total,
      paymentMethod,
      amountPaid,
      change: parseFloat(Math.max(0, amountPaid - total).toFixed(2)),
      storeId: currentStoreId,
      userId: currentUser.id,
      customerId: selectedCustomerId || undefined,
      customerName: customer?.name || undefined,
      status: "completed",
    };

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });
      if (res.ok) {
        const completedSale = await res.json();
        set((s) => {
          const updatedProducts = s.products.map((p) => {
            const cartItem = cart.find((c) => c.productId === p.id);
            if (!cartItem) return p;
            return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
          });
          const logs: InventoryLog[] = cart.map((c) => ({
            id: `${Date.now()}_${Math.random()}`,
            productId: c.productId,
            productName: c.productName,
            type: "SALE" as StockMoveType,
            qty: c.qty,
            storeId: currentStoreId,
            note: `Sale ${invoiceNo}`,
            createdAt: new Date().toISOString(),
          }));
          return {
            sales: [completedSale, ...s.sales],
            products: updatedProducts,
            inventoryLogs: [...logs, ...s.inventoryLogs],
            cart: [],
            selectedCustomerId: null,
            cartDiscount: 0,
          };
        });
        return completedSale;
      }
    } catch (err) {
      console.error("Error completing sale:", err);
    }
    return null;
  },
});
