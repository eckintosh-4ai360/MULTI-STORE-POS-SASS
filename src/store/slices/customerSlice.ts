import { StateCreator } from "zustand";
import { POSState, Customer } from "../posStore";

export interface CustomerSlice {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<void>;
}

export const createCustomerSlice: StateCreator<POSState, [], [], CustomerSlice> = (set) => ({
  customers: [],

  addCustomer: async (data) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const newCustomer = await res.json();
        set((s) => ({ customers: [newCustomer, ...s.customers] }));
      }
    } catch (err) {
      console.error("Error adding customer:", err);
    }
  },

  updateCustomer: async (id, data) => {
    try {
      const res = await fetch("/api/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      });
      if (res.ok) {
        const updatedCustomer = await res.json();
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? updatedCustomer : c)) }));
      }
    } catch (err) {
      console.error("Error updating customer:", err);
    }
  },
});
