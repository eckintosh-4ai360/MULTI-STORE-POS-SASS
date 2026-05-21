import { StateCreator } from "zustand";
import { POSState, User } from "../posStore";

export interface AuthSlice {
  currentUser: User | null;
  currentStoreId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setCurrentStore: (storeId: string) => void;
}

export const createAuthSlice: StateCreator<POSState, [], [], AuthSlice> = (set, get) => ({
  currentUser: null,
  currentStoreId: null,

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;
      const user = await res.json();

      // Fetch all data after successful auth
      await get().fetchData();

      const storeId =
        user.storeId ??
        get().stores.find((s) => s.status === "active")?.id ??
        null;

      const loggedInUser: User = { ...user, lastLogin: new Date().toISOString() };
      set({ currentUser: loggedInUser, currentStoreId: storeId });

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
    set({ currentUser: null, currentStoreId: null, cart: [], activePage: "dashboard" }),

  setCurrentStore: (storeId) => set({ currentStoreId: storeId }),
});
