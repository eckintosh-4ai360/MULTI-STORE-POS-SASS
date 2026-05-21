import { StateCreator } from "zustand";
import { POSState, Product, Category, InventoryLog, StockMoveType } from "../posStore";

export interface ProductSlice {
  products: Product[];
  categories: Category[];
  inventoryLogs: InventoryLog[];
  addProduct: (product: Omit<Product, "id">) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (productId: string, qty: number, type: StockMoveType, note?: string) => Promise<void>;
  addCategory: (cat: Omit<Category, "id">) => Promise<void>;
}

export const createProductSlice: StateCreator<POSState, [], [], ProductSlice> = (set) => ({
  products: [],
  categories: [],
  inventoryLogs: [],

  addProduct: async (data) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newProduct = await res.json();
        set((s) => ({ products: [newProduct, ...s.products] }));
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        set((s) => ({ products: s.products.map((p) => (p.id === id ? updatedProduct : p)) }));
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        set((s) => ({
          products: s.products.filter((p) => p.id !== id),
          inventoryLogs: s.inventoryLogs.filter((log) => log.productId !== id),
        }));
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  },

  adjustStock: async (productId, qty, type, note) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjustStock", productId, qty, type, note }),
      });
      if (res.ok) {
        const { product, log } = await res.json();
        set((s) => ({
          products: s.products.map((p) => (p.id === productId ? product : p)),
          inventoryLogs: [log, ...s.inventoryLogs],
        }));
      }
    } catch (err) {
      console.error("Error adjusting stock:", err);
    }
  },

  addCategory: async (data) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newCategory = await res.json();
        set((s) => ({ categories: [...s.categories, newCategory] }));
      }
    } catch (err) {
      console.error("Error adding category:", err);
    }
  },
});
