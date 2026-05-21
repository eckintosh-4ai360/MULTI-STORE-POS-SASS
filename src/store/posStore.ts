import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createAuthSlice, AuthSlice } from "./slices/authSlice";
import { createStoreSlice, StoreSlice } from "./slices/storeSlice";
import { createProductSlice, ProductSlice } from "./slices/productSlice";
import { createCustomerSlice, CustomerSlice } from "./slices/customerSlice";
import { createSupplierSlice, SupplierSlice } from "./slices/supplierSlice";
import { createSalesSlice, SalesSlice } from "./slices/salesSlice";
import { createUISlice, UISlice } from "./slices/uiSlice";

// ─── Shared Types (exported for use across app) ───────────────────────────────

export type Role = "super_admin" | "store_admin" | "manager" | "cashier";
export type PaymentMethod = "cash" | "mobile_money" | "card";
export type StockMoveType = "IN" | "OUT" | "TRANSFER" | "SALE";

export interface Store {
  id: string;
  name: string;
  location: string;
  currency: string;
  taxRate: number;
  status: "active" | "inactive";
  logo?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeId: string | null;
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

export interface Category {
  id: string;
  name: string;
  storeId: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  costPrice: number;
  stock: number;
  categoryId: string;
  storeId: string;
  expiryDate?: string;
  lowStockThreshold: number;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  storeId: string;
  creditBalance: number;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  qty: number;
  price: number;
  discount: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  storeId: string;
  userId: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
  status: "completed" | "held" | "refunded";
}

export interface InventoryLog {
  id: string;
  productId: string;
  productName: string;
  type: StockMoveType;
  qty: number;
  storeId: string;
  note?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  balance: number;
  storeId: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; productName: string; qty: number; cost: number }[];
  total: number;
  storeId: string;
  status: "pending" | "received" | "cancelled";
  createdAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  qty: number;
  discount: number;
  stock: number;
}

export interface HeldSale {
  id: string;
  items: CartItem[];
  customerId?: string;
  note?: string;
  heldAt: string;
}

// ─── User management actions (kept in root store for global access) ────────────

interface UserManagementSlice {
  users: User[];
  addUser: (user: Omit<User, "id" | "createdAt">) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
}

// ─── Combined State ───────────────────────────────────────────────────────────

export type POSState = AuthSlice &
  StoreSlice &
  ProductSlice &
  CustomerSlice &
  SupplierSlice &
  SalesSlice &
  UISlice &
  UserManagementSlice & {
    fetchData: () => Promise<void>;
  };

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePOSStore = create<POSState>()(
  persist(
    (...a) => ({
      ...createAuthSlice(...a),
      ...createStoreSlice(...a),
      ...createProductSlice(...a),
      ...createCustomerSlice(...a),
      ...createSupplierSlice(...a),
      ...createSalesSlice(...a),
      ...createUISlice(...a),

      // ── User Management ──
      users: [],

      addUser: async (data) => {
        const [set, get] = a;
        try {
          const userId = get().currentUser?.id;
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(userId ? { "x-user-id": userId } : {}) },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            const newUser = await res.json();
            set((s) => ({ users: [...s.users, newUser] }));
          }
        } catch (err) {
          console.error("Error adding user:", err);
        }
      },

      updateUser: async (id, data) => {
        const [set, get] = a;
        try {
          const userId = get().currentUser?.id;
          const res = await fetch("/api/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...(userId ? { "x-user-id": userId } : {}) },
            body: JSON.stringify({ id, ...data }),
          });
          if (res.ok) {
            const updatedUser = await res.json();
            set((s) => ({ users: s.users.map((u) => (u.id === id ? updatedUser : u)) }));
          }
        } catch (err) {
          console.error("Error updating user:", err);
        }
      },

      toggleUserStatus: async (id) => {
        const [set, get] = a;
        try {
          const user = get().users.find((u) => u.id === id);
          if (!user) return;
          const newStatus = user.status === "active" ? "inactive" : "active";
          const currentUserId = get().currentUser?.id;
          const res = await fetch("/api/users", {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...(currentUserId ? { "x-user-id": currentUserId } : {}) },
            body: JSON.stringify({ id, status: newStatus }),
          });
          if (res.ok) {
            const updatedUser = await res.json();
            set((s) => ({ users: s.users.map((u) => (u.id === id ? updatedUser : u)) }));
          }
        } catch (err) {
          console.error("Error toggling user status:", err);
        }
      },

      // ── Data Sync ──
      fetchData: async () => {
        const [set, get] = a;
        set({ isLoading: true, dataError: null });
        try {
          const userId = get().currentUser?.id;
          const headers: HeadersInit = userId ? { "x-user-id": userId } : {};
          const res = await fetch("/api/init", { headers });
          if (res.ok) {
            const data = await res.json();
            set({
              stores: data.stores || [],
              users: data.users || [],
              categories: data.categories || [],
              products: data.products || [],
              customers: data.customers || [],
              sales: data.sales || [],
              inventoryLogs: data.inventoryLogs || [],
              suppliers: data.suppliers || [],
              purchaseOrders: data.purchaseOrders || [],
              heldSales: data.heldSales || [],
              isLoading: false,
              subscription: data.subscription || null,
            });
            const current = get().currentUser;
            if (current) {
              const freshUser = (data.users || []).find((u: User) => u.id === current.id);
              if (freshUser) set({ currentUser: freshUser });
            }

          } else {
            set({ isLoading: false, dataError: "Failed to load data. Please refresh." });
          }
        } catch (err) {
          console.error("Failed to fetch POS data:", err);
          set({ isLoading: false, dataError: "Connection error. Check your internet." });
        }
      },
    }),
    {
      name: "multipos-storage",
      partialize: (state) => ({
        currentStoreId: state.currentStoreId,
        sidebarOpen: state.sidebarOpen,
        activePage: state.activePage,
        currentUser: state.currentUser,
      }),
    }
  )
);
