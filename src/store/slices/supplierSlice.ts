import { StateCreator } from "zustand";
import { POSState, Supplier, PurchaseOrder, InventoryLog, StockMoveType } from "../posStore";

export interface SupplierSlice {
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<void>;
  updateSupplier: (id: string, data: Partial<Supplier>) => Promise<void>;
  addPurchaseOrder: (order: Omit<PurchaseOrder, "id" | "createdAt">) => Promise<void>;
  receivePurchaseOrder: (id: string) => Promise<void>;
}

export const createSupplierSlice: StateCreator<POSState, [], [], SupplierSlice> = (set, get) => ({
  suppliers: [],
  purchaseOrders: [],

  addSupplier: async (data) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newSupplier = await res.json();
        set((s) => ({ suppliers: [...s.suppliers, newSupplier] }));
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
    }
  },

  updateSupplier: async (id, data) => {
    try {
      const res = await fetch("/api/suppliers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const updatedSupplier = await res.json();
        set((s) => ({
          suppliers: s.suppliers.map((sup) => (sup.id === id ? updatedSupplier : sup)),
        }));
      }
    } catch (err) {
      console.error("Error updating supplier:", err);
    }
  },

  addPurchaseOrder: async (data) => {
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newOrder = await res.json();
        set((s) => ({ purchaseOrders: [newOrder, ...s.purchaseOrders] }));
      }
    } catch (err) {
      console.error("Error adding purchase order:", err);
    }
  },

  receivePurchaseOrder: async (id) => {
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "receive" }),
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        // Re-fetch full data to sync updated stock levels and inventory logs
        await get().fetchData();
        set((s) => ({
          purchaseOrders: s.purchaseOrders.map((o) =>
            o.id === id ? { ...o, status: "received" as const } : o
          ),
        }));
      }
    } catch (err) {
      console.error("Error receiving purchase order:", err);
    }
  },
});
