import React from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store, BarChart3,
  Settings, LogOut, Truck, Tag, FileText, ChevronLeft, ChevronRight,
  Boxes, ClipboardList, UserCheck, X
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

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  const { activePage, setActivePage, sidebarOpen, toggleSidebar, currentUser, logout, stores, currentStoreId, setCurrentStore } = usePOSStore();
  const allowed = roleAccess[currentUser?.role ?? "cashier"];
  const currentStore = stores.find(s => s.id === currentStoreId);

  const handleNavClick = (id: string) => {
    setActivePage(id);
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay active"
          onClick={onMobileClose}
        />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen glass-dark text-white flex flex-col z-40 transition-all duration-300",
        // Desktop: collapsible
        "hidden md:flex",
        sidebarOpen ? "md:w-64" : "md:w-16"
      )}>
        <SidebarContent
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          allowed={allowed}
          activePage={activePage}
          handleNavClick={handleNavClick}
          currentUser={currentUser}
          currentStore={currentStore}
          stores={stores}
          currentStoreId={currentStoreId}
          setCurrentStore={setCurrentStore}
          logout={logout}
          showCloseButton={false}
        />
      </aside>

      {/* Mobile Drawer */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen glass-dark text-white flex flex-col z-40 transition-all duration-300 w-72 md:hidden",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent
          sidebarOpen={true}
          toggleSidebar={toggleSidebar}
          allowed={allowed}
          activePage={activePage}
          handleNavClick={handleNavClick}
          currentUser={currentUser}
          currentStore={currentStore}
          stores={stores}
          currentStoreId={currentStoreId}
          setCurrentStore={setCurrentStore}
          logout={logout}
          showCloseButton={true}
          onClose={onMobileClose}
        />
      </aside>
    </>
  );
};

interface SidebarContentProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  allowed: string[];
  activePage: string;
  handleNavClick: (id: string) => void;
  currentUser: any;
  currentStore: any;
  stores: any[];
  currentStoreId: string | null;
  setCurrentStore: (id: string) => void;
  logout: () => void;
  showCloseButton: boolean;
  onClose?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  sidebarOpen, toggleSidebar, allowed, activePage, handleNavClick,
  currentUser, currentStore, stores, currentStoreId, setCurrentStore, logout,
  showCloseButton, onClose
}) => (
  <>
    {/* Logo */}
    <div className="flex items-center justify-between px-4 py-4 border-b border-white/8">
      {sidebarOpen && (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-sm tracking-tight">MultiPOS</span>
            <p className="text-[10px] text-indigo-300/70">Retail Intelligence</p>
          </div>
        </div>
      )}
      {!sidebarOpen && (
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
          <ShoppingCart size={16} className="text-white" />
        </div>
      )}
      {showCloseButton ? (
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition ml-auto">
          <X size={16} />
        </button>
      ) : (
        <button onClick={toggleSidebar} className="p-1.5 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition ml-auto">
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
    </div>

    {/* Store Switcher */}
    {sidebarOpen && currentUser?.role === "super_admin" && (
      <div className="px-3 py-2 border-b border-white/8">
        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1.5 px-1">Active Store</p>
        <select
          value={currentStoreId ?? ""}
          onChange={e => setCurrentStore(e.target.value)}
          className="w-full bg-white/8 text-white text-xs rounded-xl px-3 py-2 border border-white/12 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white/12 transition"
        >
          {stores.map(s => <option key={s.id} value={s.id} className="bg-slate-800">{s.name}</option>)}
        </select>
      </div>
    )}

    {sidebarOpen && currentStore && currentUser?.role !== "super_admin" && (
      <div className="px-4 py-2.5 border-b border-white/8">
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Current Store</p>
        <p className="text-xs font-semibold text-indigo-300 truncate mt-0.5">{currentStore.name}</p>
      </div>
    )}

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-hide">
      {navGroups.map(group => {
        const visibleItems = group.items.filter(item => allowed.includes(item.id));
        if (!visibleItems.length) return null;
        return (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="text-[10px] uppercase tracking-widest text-white/30 px-2 mb-1.5 font-semibold">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {visibleItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                    activePage === id
                      ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/20 text-white border border-indigo-400/30 shadow-lg shadow-indigo-500/10"
                      : "text-white/50 hover:bg-white/8 hover:text-white/90",
                    !sidebarOpen && "justify-center"
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={17} className={cn("flex-shrink-0 transition-colors", activePage === id ? "text-indigo-300" : "text-white/40 group-hover:text-white/80")} />
                  {sidebarOpen && <span className="truncate font-medium">{label}</span>}
                  {sidebarOpen && activePage === id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>

    {/* User */}
    <div className="border-t border-white/8 p-3">
      {sidebarOpen ? (
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/6 transition">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-md">
            {currentUser?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-white/40 capitalize">{currentUser?.role?.replace("_", " ")}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <button onClick={logout} className="w-full flex justify-center p-2 rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 transition" title="Logout">
          <LogOut size={18} />
        </button>
      )}
    </div>
  </>
);


