import React from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, Store as StoreIcon, BarChart3,
  Settings, LogOut, Truck, Tag, FileText, ChevronLeft, ChevronRight,
  Boxes, ClipboardList, UserCheck, X
} from "lucide-react";
import { usePOSStore, User, Store as PosStore } from "../../store/posStore";
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
      { id: "stores", label: "Stores", icon: StoreIcon },
      { id: "audit_logs", label: "Audit Logs", icon: ClipboardList },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const roleAccess: Record<string, string[]> = {
  super_admin: ["dashboard", "pos", "products", "categories", "inventory", "customers", "suppliers", "users", "sales", "purchases", "reports", "stores", "audit_logs", "settings"],
  store_admin: ["dashboard", "pos", "products", "categories", "inventory", "customers", "suppliers", "users", "sales", "purchases", "reports", "audit_logs", "settings"],
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
        "fixed left-0 top-0 h-screen glass border-r border-slate-200/50 text-slate-800 flex flex-col z-40 transition-all duration-300",
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
        "fixed left-0 top-0 h-screen glass border-r border-slate-200/50 text-slate-800 flex flex-col z-40 transition-all duration-300 w-72 md:hidden",
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
  currentUser: User | null;
  currentStore: PosStore | undefined;
  stores: PosStore[];
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
    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200/50">
      {sidebarOpen && (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShoppingCart size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">MultiPOS</span>
            <p className="text-[10px] text-indigo-600/80 font-medium">Retail Intelligence</p>
          </div>
        </div>
      )}
      {!sidebarOpen && (
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
          <ShoppingCart size={16} className="text-white" />
        </div>
      )}
      {showCloseButton ? (
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition ml-auto">
          <X size={16} />
        </button>
      ) : (
        <button onClick={toggleSidebar} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition ml-auto">
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
    </div>

    {/* Store Switcher */}
    {sidebarOpen && currentUser?.role === "super_admin" && (
      <div className="px-3 py-2 border-b border-slate-200/50">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 px-1 font-semibold">Active Store</p>
        <select
          value={currentStoreId ?? ""}
          onChange={e => setCurrentStore(e.target.value)}
          className="w-full bg-white/70 text-slate-800 text-xs rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:bg-white transition"
        >
          {stores.map(s => <option key={s.id} value={s.id} className="bg-white text-slate-800">{s.name}</option>)}
        </select>
      </div>
    )}

    {sidebarOpen && currentStore && currentUser?.role !== "super_admin" && (
      <div className="px-4 py-2.5 border-b border-slate-200/50">
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Current Store</p>
        <p className="text-xs font-bold text-indigo-600 truncate mt-0.5">{currentStore.name}</p>
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
              <p className="text-[10px] uppercase tracking-widest text-slate-400 px-2 mb-1.5 font-bold">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {visibleItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group",
                    activePage === id
                      ? "bg-indigo-50/80 text-indigo-700 font-semibold border border-indigo-100 shadow-sm shadow-indigo-500/5"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800",
                    !sidebarOpen && "justify-center"
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={17} className={cn("flex-shrink-0 transition-colors", activePage === id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
                  {sidebarOpen && <span className="truncate font-semibold">{label}</span>}
                  {sidebarOpen && activePage === id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>

    {/* User */}
    <div className="border-t border-slate-200/50 p-3">
      {sidebarOpen ? (
        <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/50 transition">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
            {currentUser?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-400 capitalize font-medium">{currentUser?.role?.replace("_", " ")}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <button onClick={logout} className="w-full flex justify-center p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition" title="Logout">
          <LogOut size={18} />
        </button>
      )}
    </div>
  </>
);


