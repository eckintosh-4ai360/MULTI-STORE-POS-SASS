import { StateCreator } from "zustand";
import { POSState, Store } from "../posStore";

export interface StoreSlice {
  stores: Store[];
  addStore: (store: Omit<Store, "id">) => Promise<void>;
  updateStore: (id: string, data: Partial<Store>) => Promise<void>;
  toggleStoreStatus: (id: string) => Promise<void>;
}

export const createStoreSlice: StateCreator<POSState, [], [], StoreSlice> = (set, get) => ({
  stores: [],

  addStore: async (data) => {
    try {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newStore = await res.json();
        set((s) => ({ stores: [...s.stores, newStore] }));
      }
    } catch (err) {
      console.error("Error adding store:", err);
    }
  },

  updateStore: async (id, data) => {
    try {
      const res = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const updatedStore = await res.json();
        set((s) => ({ stores: s.stores.map((st) => (st.id === id ? updatedStore : st)) }));
      }
    } catch (err) {
      console.error("Error updating store:", err);
    }
  },

  toggleStoreStatus: async (id) => {
    try {
      const store = get().stores.find((st) => st.id === id);
      if (!store) return;
      const newStatus = store.status === "active" ? "inactive" : "active";
      const res = await fetch("/api/stores", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        const updatedStore = await res.json();
        set((s) => ({ stores: s.stores.map((st) => (st.id === id ? updatedStore : st)) }));
      }
    } catch (err) {
      console.error("Error toggling store status:", err);
    }
  },
});
