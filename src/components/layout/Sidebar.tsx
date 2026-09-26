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
        "fixed left-0 top-0 h-screen overflow-hidden bg-gradient-to-b from-[#1e60c7] via-[#2866c5] to-[#154ba8] text-white flex flex-col z-40 shadow-[10px_0_30px_rgba(25,73,165,0.18)] transition-all duration-300",
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
        "fixed left-0 top-0 h-screen overflow-hidden bg-gradient-to-b from-[#1e60c7] via-[#2866c5] to-[#154ba8] text-white flex flex-col z-40 shadow-[10px_0_30px_rgba(25,73,165,0.25)] transition-all duration-300 w-72 md:hidden",
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
    <div className={cn(
      "relative flex items-center justify-between px-4 py-4 transition-all duration-300",
      sidebarOpen ? "min-h-[88px] bg-white text-[#1f5fbd] rounded-br-[48px] shadow-[0_8px_18px_rgba(11,51,125,0.10)]" : "min-h-16 bg-white/10 text-white"
    )}>
      {sidebarOpen && (
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2c72d0] to-[#174ea9] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25">
            <ShoppingCart size={17} className="text-white" />
          </div>
          <div>
            <span className="font-extrabold text-[#1d5bb8] text-base tracking-[-0.03em]">MultiPOS</span>
            <p className="text-[10px] text-[#4f78b7] font-semibold tracking-wide">Retail Intelligence</p>
          </div>
        </div>
      )}
      {!sidebarOpen && (
        <div className="w-9 h-9 bg-white/15 border border-white/15 rounded-xl flex items-center justify-center mx-auto">
          <ShoppingCart size={16} className="text-white" />
        </div>
      )}
      {showCloseButton ? (
        <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-blue-50 text-[#6090cf] hover:text-[#1d5bb8] transition ml-auto">
          <X size={16} />
        </button>
      ) : (
        <button onClick={toggleSidebar} className={cn("p-1.5 rounded-xl transition ml-auto", sidebarOpen ? "text-[#6090cf] hover:bg-blue-50 hover:text-[#1d5bb8]" : "text-white/65 hover:bg-white/10 hover:text-white")}>
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      )}
    </div>

    {/* Store Switcher */}
    {sidebarOpen && currentUser?.role === "super_admin" && (
      <div className="mx-3 mt-4 rounded-2xl border border-white/15 bg-white/10 p-2.5">
        <p className="text-[10px] text-white/60 uppercase tracking-[0.14em] mb-1.5 px-1 font-bold">Active Store</p>
        <select
          value={currentStoreId ?? ""}
          onChange={e => setCurrentStore(e.target.value)}
          className="w-full bg-white/95 text-[#265fae] text-xs font-semibold rounded-xl px-3 py-2 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
        >
          {stores.map(s => <option key={s.id} value={s.id} className="bg-white text-slate-800">{s.name}</option>)}
        </select>
      </div>
    )}

    {sidebarOpen && currentStore && currentUser?.role !== "super_admin" && (
      <div className="mx-3 mt-4 rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5">
        <p className="text-[10px] text-white/60 uppercase tracking-[0.14em] font-bold">Current Store</p>
        <p className="text-xs font-bold text-white truncate mt-0.5">{currentStore.name}</p>
      </div>
    )}

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-5 scrollbar-hide">
      {navGroups.map(group => {
        const visibleItems = group.items.filter(item => allowed.includes(item.id));
        if (!visibleItems.length) return null;
        return (
          <div key={group.label}>
            {sidebarOpen && (
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/55 px-3 mb-2 font-extrabold">{group.label}</p>
            )}
            <div className="space-y-0.5">
              {visibleItems.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all duration-200 group",
                    activePage === id
                      ? "bg-white text-[#235eb8] font-bold shadow-[0_8px_18px_rgba(10,48,123,0.16)]"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                    !sidebarOpen && "justify-center"
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon size={17} className={cn("flex-shrink-0 transition-colors", activePage === id ? "text-[#2364c5]" : "text-white/65 group-hover:text-white")} />
                  {sidebarOpen && <span className="truncate font-semibold">{label}</span>}
                  {sidebarOpen && activePage === id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-[#2364c5] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </nav>

    {/* User */}
    <div className="border-t border-white/15 p-3">
      {sidebarOpen ? (
        <div className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-white/10 transition">
          <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md">
            {currentUser?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-white/55 capitalize font-medium">{currentUser?.role?.replace("_", " ")}</p>
          </div>
          <button onClick={logout} className="p-1.5 rounded-lg hover:bg-white/15 text-white/55 hover:text-white transition" title="Logout">
            <LogOut size={14} />
          </button>
        </div>
      ) : (
        <button onClick={logout} className="w-full flex justify-center p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition" title="Logout">
          <LogOut size={18} />
        </button>
      )}
    </div>
  </>
);

