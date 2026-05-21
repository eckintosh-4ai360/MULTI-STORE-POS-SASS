import { StateCreator } from "zustand";
import { POSState, User } from "../posStore";

export interface SubscriptionData {
  plan: string;
  status: string;
  trialEnd?: string | null;
  currentPeriodEnd?: string | null;
  paystackCustomerCode?: string | null;
}

export interface AuthSlice {
  currentUser: User | null;
  currentStoreId: string | null;
  subscription: SubscriptionData | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentStore: (storeId: string) => void;
  setSubscription: (sub: SubscriptionData | null) => void;
}

export const createAuthSlice: StateCreator<POSState, [], [], AuthSlice> = (set, get) => ({
  currentUser: null,
  currentStoreId: null,
  subscription: null,
  setSubscription: (sub) => set({ subscription: sub }),

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const user = await res.json();

      // Set currentUser FIRST so fetchData() can use the user id for auth
      const loggedInUser: User = { ...user, lastLogin: new Date().toISOString() };
      set({ currentUser: loggedInUser });

      // Now fetch all org-scoped data from the server
      await get().fetchData();

      // Log lastLogin asynchronously without blocking
      fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, lastLogin: loggedInUser.lastLogin }),
      }).catch((err) => console.error("Failed to log last login:", err));

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  },

  logout: () =>
    set({
      currentUser: null,
      currentStoreId: null,
      subscription: null,
      organization: null,
      cart: [],
      activePage: "dashboard",
      // Clear all org-scoped data so next login starts fresh
      stores: [],
      users: [],
      categories: [],
      products: [],
      customers: [],
      sales: [],
      inventoryLogs: [],
      suppliers: [],
      purchaseOrders: [],
      heldSales: [],
    }),

  setCurrentStore: (storeId) => set({ currentStoreId: storeId }),
});
