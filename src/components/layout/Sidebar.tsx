import React from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, BarChart3,
  Settings, LogOut, Truck, Tag, FileText, ChevronLeft, ChevronRight,
  Boxes, ClipboardList, UserCheck
} from "lucide-react";
import { usePOSStore } from "../../store/posStore";
import { cn } from "../../utils/cn";

const navGroups = [
  {
    label: "Main",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "pos", label: "POS Terminal", icon: ShoppingCart },
    ],
  },
  {
    label: "Inventory",
    items: [
      { id: "products", label: "Products", icon: Package },
      { id: "categories", label: "Categories", icon: Tag },
      { id: "inventory", label: "Stock Logs", icon: Boxes },
    ],
  },
  {
    label: "People",
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "suppliers", label: "Suppliers", icon: Truck },
      { id: "users", label: "Users", icon: UserCheck },
    ],
  },
  {
    label: "Business",
    items: [
      { id: "sales", label: "Sales History", icon: ClipboardList },
      { id: "purchases", label: "Purchase Orders", icon: FileText },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
  {
    label: "Admin",
    items: [
      { id: "stores", label: "Stores", icon: Store },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const roleAccess: Record<string, string[]> = {
  super_admin: ["dashboard", "pos", "products", "categories", "inventory", "customers", "suppliers", "users", "sales", "purchases", "reports", "stores", "settings"],
  store_admin: ["dashboard", "pos", "products", "categories", "inventory", "customers", "suppliers", "users", "sales", "purchases", "reports", "settings"],
  manager: ["dashboard", "pos", "products", "categories", "inventory", "customers", "suppliers", "sales", "purchases", "reports"],
  cashier: ["dashboard", "pos", "customers", "sales"],
};

export const Sidebar: React.FC = () => {
  const { activePage, setActivePage, sidebarOpen, toggleSidebar, currentUser, logout, stores, currentStoreId, setCurrentStore } = usePOSStore();
  const allowed = roleAccess[currentUser?.role ?? "cashier"];
  const currentStore = stores.find(s => s.id === currentStoreId);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-gray-900 text-white flex flex-col z-40 transition-all duration-300",
      sidebarOpen ? "w-64" : "w-16"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700/50">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">M</div>
            <span className="font-bold text-white tracking-tight">MultiPOS</span>
          </div>
        )}
        {!sidebarOpen && <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold mx-auto">M</div>}
        <button onClick={toggleSidebar} className="p-1 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition ml-auto">
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Store Switcher */}
      {sidebarOpen && currentUser?.role === "super_admin" && (
        <div className="px-3 py-2 border-b border-gray-700/50">
          <select
            value={currentStoreId ?? ""}
            onChange={e => setCurrentStore(e.target.value)}
            className="w-full bg-gray-800 text-white text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {sidebarOpen && currentStore && currentUser?.role !== "super_admin" && (
        <div className="px-4 py-2 border-b border-gray-700/50">
          <p className="text-xs text-gray-400">Current Store</p>
          <p className="text-xs font-medium text-indigo-300 truncate">{currentStore.name}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => allowed.includes(item.id));
          if (!visibleItems.length) return null;
          return (
            <div key={group.label}>
              {sidebarOpen && <p className="text-[10px] uppercase tracking-widest text-gray-500 px-2 mb-1 font-semibold">{group.label}</p>}
              <div className="space-y-0.5">
                {visibleItems.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActivePage(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-all duration-150",
                      activePage === id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                      !sidebarOpen && "justify-center"
                    )}
                    title={!sidebarOpen ? label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {sidebarOpen && <span className="truncate">{label}</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-gray-700/50 p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {currentUser?.name?.[0] ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role?.replace("_", " ")}</p>
            </div>
            <button onClick={logout} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition">
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button onClick={logout} className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition" title="Logout">
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};
