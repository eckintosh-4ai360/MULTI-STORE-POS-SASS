import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  storeId: string | null; // null = super admin (all stores)
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
// ─── App State

interface POSState {
  // Auth
  currentUser: User | null;
  currentStoreId: string | null;

  // Data
  stores: Store[];
  users: User[];
  categories: Category[];
  products: Product[];
  customers: Customer[];
  sales: Sale[];
  inventoryLogs: InventoryLog[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  heldSales: HeldSale[];

  // POS Cart
  cart: CartItem[];
  selectedCustomerId: string | null;
  cartDiscount: number;

  // UI Navigation
  activePage: string;
  sidebarOpen: boolean;

  // Actions — Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setCurrentStore: (storeId: string) => void;

  // Actions — Stores
  addStore: (store: Omit<Store, "id">) => void;
  updateStore: (id: string, data: Partial<Store>) => void;
  toggleStoreStatus: (id: string) => void;

  // Actions — Users
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  // Actions — Products
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (productId: string, qty: number, type: StockMoveType, note?: string) => void;

  // Actions — Categories
  addCategory: (cat: Omit<Category, "id">) => void;

  // Actions — Customers
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  // Actions — POS Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  updateCartItemDiscount: (productId: string, discount: number) => void;
  setCartDiscount: (discount: number) => void;
  setSelectedCustomer: (customerId: string | null) => void;
  clearCart: () => void;
  holdSale: (note?: string) => void;
  resumeHeldSale: (id: string) => void;
  deleteHeldSale: (id: string) => void;
  completeSale: (paymentMethod: PaymentMethod, amountPaid: number) => Sale | null;

  // Actions — Suppliers
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;

  // Actions — Purchase Orders
  addPurchaseOrder: (order: Omit<PurchaseOrder, "id" | "createdAt">) => void;
  receivePurchaseOrder: (id: string) => void;

  // Loading / error state
  isLoading: boolean;
  dataError: string | null;

  // Organization
  organization: { id: string; name: string; slug: string; ownerEmail: string } | null;

  // Actions — Data
  fetchData: () => Promise<void>;

  // Actions — UI
  setActivePage: (page: string) => void;
  toggleSidebar: () => void;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const seedStores: Store[] = [
  { id: "s1", name: "Accra Mall Branch", location: "Accra, Greater Accra", currency: "GHS", taxRate: 15, status: "active", receiptHeader: "Thank you for shopping with us!", receiptFooter: "Visit us again soon." },
  { id: "s2", name: "Kumasi Central", location: "Kumasi, Ashanti Region", currency: "GHS", taxRate: 15, status: "active", receiptHeader: "Kumasi's Best Store", receiptFooter: "Call us: 0244-123456" },
  { id: "s3", name: "Takoradi Harbour", location: "Takoradi, Western Region", currency: "GHS", taxRate: 15, status: "active", receiptHeader: "Quality Products, Fair Prices", receiptFooter: "Follow us on social media" },
];

const seedUsers: User[] = [
  { id: "u1", name: "Super Admin", email: "admin@multipos.com", role: "super_admin", storeId: null, status: "active", createdAt: "2024-01-01", lastLogin: "2024-12-01" },
  { id: "u2", name: "Kwame Asante", email: "kwame@multipos.com", role: "store_admin", storeId: "s1", status: "active", createdAt: "2024-01-10" },
  { id: "u3", name: "Ama Boateng", email: "ama@multipos.com", role: "cashier", storeId: "s1", status: "active", createdAt: "2024-02-01" },
  { id: "u4", name: "Kofi Mensah", email: "kofi@multipos.com", role: "manager", storeId: "s2", status: "active", createdAt: "2024-02-15" },
  { id: "u5", name: "Abena Osei", email: "abena@multipos.com", role: "cashier", storeId: "s2", status: "active", createdAt: "2024-03-01" },
  { id: "u6", name: "Yaw Darko", email: "yaw@multipos.com", role: "cashier", storeId: "s3", status: "inactive", createdAt: "2024-03-10" },
];

const seedCategories: Category[] = [
  { id: "c1", name: "Beverages", storeId: "s1" },
  { id: "c2", name: "Snacks", storeId: "s1" },
  { id: "c3", name: "Electronics", storeId: "s2" },
  { id: "c4", name: "Clothing", storeId: "s3" },
  { id: "c5", name: "Dairy", storeId: "s1" },
  { id: "c6", name: "Toiletries", storeId: "s2" },
];

const seedProducts: Product[] = [
  { id: "p1", name: "Coca-Cola 500ml", barcode: "5000112637922", price: 5.50, costPrice: 3.80, stock: 120, categoryId: "c1", storeId: "s1", lowStockThreshold: 20 },
  { id: "p2", name: "Pepsi 330ml Can", barcode: "5000112645292", price: 4.00, costPrice: 2.60, stock: 8, categoryId: "c1", storeId: "s1", lowStockThreshold: 20, expiryDate: "2025-06-30" },
  { id: "p3", name: "Pringles Original", barcode: "5053990103065", price: 18.00, costPrice: 12.00, stock: 45, categoryId: "c2", storeId: "s1", lowStockThreshold: 10 },
  { id: "p4", name: "Digestive Biscuits", barcode: "5000168014527", price: 8.50, costPrice: 5.50, stock: 60, categoryId: "c2", storeId: "s1", lowStockThreshold: 15 },
  { id: "p5", name: "Fan Milk Ice Cream", barcode: "6001007071015", price: 6.00, costPrice: 4.00, stock: 3, categoryId: "c5", storeId: "s1", lowStockThreshold: 10, expiryDate: "2025-03-15" },
  { id: "p6", name: "Samsung Galaxy A05", barcode: "8806094904697", price: 850.00, costPrice: 680.00, stock: 15, categoryId: "c3", storeId: "s2", lowStockThreshold: 5 },
  { id: "p7", name: "Wireless Earbuds Pro", barcode: "6941487222789", price: 120.00, costPrice: 75.00, stock: 32, categoryId: "c3", storeId: "s2", lowStockThreshold: 8 },
  { id: "p8", name: "USB-C Charging Cable", barcode: "0728028222789", price: 25.00, costPrice: 12.00, stock: 5, categoryId: "c3", storeId: "s2", lowStockThreshold: 10 },
  { id: "p9", name: "Head & Shoulders 400ml", barcode: "8001090522924", price: 35.00, costPrice: 24.00, stock: 28, categoryId: "c6", storeId: "s2", lowStockThreshold: 10 },
  { id: "p10", name: "Men's Polo Shirt", barcode: "9780143127796", price: 65.00, costPrice: 42.00, stock: 22, categoryId: "c4", storeId: "s3", lowStockThreshold: 5 },
  { id: "p11", name: "Ladies Ankara Dress", barcode: "9780143127797", price: 120.00, costPrice: 80.00, stock: 18, categoryId: "c4", storeId: "s3", lowStockThreshold: 5 },
  { id: "p12", name: "Kids School Bag", barcode: "9780143127798", price: 45.00, costPrice: 28.00, stock: 12, categoryId: "c4", storeId: "s3", lowStockThreshold: 5 },
];

const seedCustomers: Customer[] = [
  { id: "cu1", name: "Emmanuel Quartey", phone: "0244-111222", email: "eq@gmail.com", storeId: "s1", creditBalance: 0, createdAt: "2024-03-01" },
  { id: "cu2", name: "Fatima Ibrahim", phone: "0501-334455", storeId: "s1", creditBalance: 45.50, createdAt: "2024-04-10" },
  { id: "cu3", name: "Bright Owusu", phone: "0277-567890", storeId: "s2", creditBalance: 0, createdAt: "2024-05-20" },
  { id: "cu4", name: "Akosua Ntim", phone: "0242-998877", storeId: "s3", creditBalance: 120.00, createdAt: "2024-06-15" },
];

const now = new Date();
const seedSales: Sale[] = Array.from({ length: 40 }, (_, i) => {
  const date = new Date(now);
  date.setDate(date.getDate() - Math.floor(i / 3));
  const storeId = ["s1", "s2", "s3"][i % 3];
  const total = parseFloat((Math.random() * 300 + 20).toFixed(2));
  const tax = parseFloat((total * 0.15).toFixed(2));
  return {
    id: `sale_${i + 1}`,
    invoiceNo: `INV-${storeId.toUpperCase()}-${String(1000 + i).padStart(4, "0")}`,
    items: [{ productId: "p1", productName: "Coca-Cola 500ml", qty: 2, price: 5.50, discount: 0 }],
    subtotal: parseFloat((total - tax).toFixed(2)),
    taxAmount: tax,
    discountAmount: 0,
    total,
    paymentMethod: (["cash", "mobile_money", "card"] as PaymentMethod[])[i % 3],
    amountPaid: total,
    change: 0,
    storeId,
    userId: i % 2 === 0 ? "u3" : "u2",
    createdAt: date.toISOString(),
    status: "completed" as const,
  };
});

const seedSuppliers: Supplier[] = [
  { id: "sup1", name: "Accra Beverages Ltd", phone: "0302-123456", email: "orders@accrabev.com", address: "Industrial Area, Accra", balance: 0, storeId: "s1" },
  { id: "sup2", name: "TechSource Ghana", phone: "0302-654321", email: "supply@techsource.gh", address: "Ring Road, Kumasi", balance: 1500, storeId: "s2" },
  { id: "sup3", name: "Fashion Hub Imports", phone: "0312-111222", storeId: "s3", balance: 0 },
];

const seedInventoryLogs: InventoryLog[] = [
  { id: "il1", productId: "p1", productName: "Coca-Cola 500ml", type: "IN", qty: 50, storeId: "s1", note: "Monthly restock", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "il2", productId: "p2", productName: "Pepsi 330ml Can", type: "OUT", qty: 12, storeId: "s1", note: "Damaged stock removed", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "il3", productId: "p6", productName: "Samsung Galaxy A05", type: "IN", qty: 5, storeId: "s2", note: "New shipment", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "il4", productId: "p8", productName: "USB-C Charging Cable", type: "TRANSFER", qty: 10, storeId: "s2", note: "Transfer from Accra", createdAt: new Date().toISOString() },
];

// ─── Store

const generateId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`;

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      currentStoreId: null,
      // Start with empty arrays — real data loads via fetchData() after login
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
      cart: [],
      selectedCustomerId: null,
      cartDiscount: 0,
      activePage: "dashboard",
      sidebarOpen: true,
      isLoading: false,
      dataError: null,
      organization: null,

      // ── Data ──
      fetchData: async () => {
        const currentUser = get().currentUser;
        if (!currentUser?.id) return; // Not logged in, nothing to fetch

        set({ isLoading: true, dataError: null });
        try {
          const res = await fetch("/api/init", {
            headers: { "x-user-id": currentUser.id },
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            set({ isLoading: false, dataError: errData.error || "Failed to load data. Please refresh." });
            return;
          }

          const data = await res.json();

          // Pick the right store for this user
          const storeId =
            currentUser.storeId ??
            (data.stores as Store[]).find((s: Store) => s.status === "active")?.id ??
            null;

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
            organization: data.organization || null,
            currentStoreId: get().currentStoreId || storeId,
            isLoading: false,
          });

          // Update subscription
          if (data.subscription && typeof get().setSubscription === "function") {
            get().setSubscription(data.subscription);
          }
        } catch (err) {
          console.error("fetchData error:", err);
          set({ isLoading: false, dataError: "Connection error. Please check your network." });
        }
      },

      // ── Auth ──
      login: (email, _password) => {
        const user = get().users.find(u => u.email === email && u.status === "active");
        if (!user) return false;
        const storeId = user.storeId ?? get().stores.find(s => s.status === "active")?.id ?? null;
        set({ currentUser: { ...user, lastLogin: new Date().toISOString() }, currentStoreId: storeId });
        return true;
      },
      logout: () => set({ currentUser: null, currentStoreId: null, cart: [], activePage: "dashboard" }),
      setCurrentStore: (storeId) => set({ currentStoreId: storeId }),

      // ── Stores ──
      addStore: (data) => set(s => ({ stores: [...s.stores, { ...data, id: generateId() }] })),
      updateStore: (id, data) => set(s => ({ stores: s.stores.map(st => st.id === id ? { ...st, ...data } : st) })),
      toggleStoreStatus: (id) => set(s => ({ stores: s.stores.map(st => st.id === id ? { ...st, status: st.status === "active" ? "inactive" : "active" } : st) })),

      // ── Users ──
      addUser: (data) => set(s => ({ users: [...s.users, { ...data, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateUser: (id, data) => set(s => ({ users: s.users.map(u => u.id === id ? { ...u, ...data } : u) })),
      toggleUserStatus: (id) => set(s => ({ users: s.users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u) })),

      // ── Products ──
      addProduct: (data) => set(s => ({ products: [...s.products, { ...data, id: generateId() }] })),
      updateProduct: (id, data) => set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...data } : p) })),
      deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),
      adjustStock: (productId, qty, type, note) => {
        set(s => {
          const product = s.products.find(p => p.id === productId);
          if (!product) return s;
          const newQty = type === "IN" || type === "TRANSFER" ? product.stock + qty : Math.max(0, product.stock - qty);
          const log: InventoryLog = { id: generateId(), productId, productName: product.name, type, qty, storeId: product.storeId, note, createdAt: new Date().toISOString() };
          return { products: s.products.map(p => p.id === productId ? { ...p, stock: newQty } : p), inventoryLogs: [...s.inventoryLogs, log] };
        });
      },

      // ── Categories ──
      addCategory: (data) => set(s => ({ categories: [...s.categories, { ...data, id: generateId() }] })),

      // ── Customers ──
      addCustomer: (data) => set(s => ({ customers: [...s.customers, { ...data, id: generateId(), createdAt: new Date().toISOString() }] })),
      updateCustomer: (id, data) => set(s => ({ customers: s.customers.map(c => c.id === id ? { ...c, ...data } : c) })),

      // ── Cart ──
      addToCart: (product) => {
        set(s => {
          const existing = s.cart.find(c => c.productId === product.id);
          if (existing) {
            return { cart: s.cart.map(c => c.productId === product.id ? { ...c, qty: Math.min(c.qty + 1, product.stock) } : c) };
          }
          return { cart: [...s.cart, { productId: product.id, productName: product.name, price: product.price, qty: 1, discount: 0, stock: product.stock }] };
        });
      },
      removeFromCart: (productId) => set(s => ({ cart: s.cart.filter(c => c.productId !== productId) })),
      updateCartQty: (productId, qty) => set(s => ({ cart: s.cart.map(c => c.productId === productId ? { ...c, qty: Math.max(1, Math.min(qty, c.stock)) } : c) })),
      updateCartItemDiscount: (productId, discount) => set(s => ({ cart: s.cart.map(c => c.productId === productId ? { ...c, discount: Math.max(0, Math.min(discount, 100)) } : c) })),
      setCartDiscount: (discount) => set({ cartDiscount: Math.max(0, Math.min(discount, 100)) }),
      setSelectedCustomer: (customerId) => set({ selectedCustomerId: customerId }),
      clearCart: () => set({ cart: [], selectedCustomerId: null, cartDiscount: 0 }),

      holdSale: (note) => {
        const { cart, selectedCustomerId } = get();
        if (!cart.length) return;
        const held: HeldSale = { id: generateId(), items: cart, customerId: selectedCustomerId ?? undefined, note, heldAt: new Date().toISOString() };
        set(s => ({ heldSales: [...s.heldSales, held], cart: [], selectedCustomerId: null, cartDiscount: 0 }));
      },
      resumeHeldSale: (id) => {
        const held = get().heldSales.find(h => h.id === id);
        if (!held) return;
        set(s => ({ cart: held.items, selectedCustomerId: held.customerId ?? null, heldSales: s.heldSales.filter(h => h.id !== id) }));
      },
      deleteHeldSale: (id) => set(s => ({ heldSales: s.heldSales.filter(h => h.id !== id) })),

      completeSale: (paymentMethod, amountPaid) => {
        const { cart, currentStoreId, currentUser, selectedCustomerId, customers, cartDiscount } = get();
        if (!cart.length || !currentStoreId || !currentUser) return null;
        const store = get().stores.find(s => s.id === currentStoreId);
        const taxRate = store?.taxRate ?? 15;
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty * (1 - item.discount / 100), 0);
        const discountAmount = subtotal * (cartDiscount / 100);
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (taxRate / 100);
        const total = parseFloat((afterDiscount + taxAmount).toFixed(2));
        const storeAbbr = currentStoreId.toUpperCase();
        const invoiceNo = `INV-${storeAbbr}-${Date.now().toString().slice(-6)}`;
        const customer = selectedCustomerId ? customers.find(c => c.id === selectedCustomerId) : null;
        const sale: Sale = {
          id: generateId(), invoiceNo,
          items: cart.map(c => ({ productId: c.productId, productName: c.productName, qty: c.qty, price: c.price, discount: c.discount })),
          subtotal: parseFloat(subtotal.toFixed(2)), taxAmount: parseFloat(taxAmount.toFixed(2)),
          discountAmount: parseFloat(discountAmount.toFixed(2)), total, paymentMethod, amountPaid,
          change: parseFloat(Math.max(0, amountPaid - total).toFixed(2)),
          storeId: currentStoreId, userId: currentUser.id,
          customerId: selectedCustomerId ?? undefined, customerName: customer?.name,
          createdAt: new Date().toISOString(), status: "completed",
        };
        set(s => {
          const updatedProducts = s.products.map(p => {
            const cartItem = cart.find(c => c.productId === p.id);
            if (!cartItem) return p;
            return { ...p, stock: Math.max(0, p.stock - cartItem.qty) };
          });
          const logs: InventoryLog[] = cart.map(c => ({ id: generateId(), productId: c.productId, productName: c.productName, type: "SALE" as StockMoveType, qty: c.qty, storeId: currentStoreId, note: `Sale ${invoiceNo}`, createdAt: new Date().toISOString() }));
          return { sales: [sale, ...s.sales], products: updatedProducts, inventoryLogs: [...s.inventoryLogs, ...logs], cart: [], selectedCustomerId: null, cartDiscount: 0 };
        });
        return sale;
      },

      // ── Suppliers ──
      addSupplier: (data) => set(s => ({ suppliers: [...s.suppliers, { ...data, id: generateId() }] })),
      updateSupplier: (id, data) => set(s => ({ suppliers: s.suppliers.map(sup => sup.id === id ? { ...sup, ...data } : sup) })),

      // ── Purchase Orders ──
      addPurchaseOrder: (data) => set(s => ({ purchaseOrders: [...s.purchaseOrders, { ...data, id: generateId(), createdAt: new Date().toISOString() }] })),
      receivePurchaseOrder: (id) => {
        const order = get().purchaseOrders.find(o => o.id === id);
        if (!order || order.status !== "pending") return;
        set(s => {
          const updatedProducts = s.products.map(p => {
            const item = order.items.find(i => i.productId === p.id);
            if (!item) return p;
            return { ...p, stock: p.stock + item.qty };
          });
          return { purchaseOrders: s.purchaseOrders.map(o => o.id === id ? { ...o, status: "received" } : o), products: updatedProducts };
        });
      },

      // ── UI ──
      setActivePage: (page) => set({ activePage: page }),
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: "multipos-storage",
      // Only persist minimal session state — never cache data arrays.
      // All business data (stores, products, sales, etc.) is fetched fresh
      // from the server on every login via fetchData().
      partialize: (state) => ({
        currentUser: state.currentUser,
        currentStoreId: state.currentStoreId,
        activePage: state.activePage,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
