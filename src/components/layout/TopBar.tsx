import React from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";
import { usePOSStore } from "../../store/posStore";

const pageTitles: Record<string, string> = {
  dashboard: "Dashboard",
  pos: "POS Terminal",
  products: "Products & Inventory",
  categories: "Categories",
  inventory: "Stock Logs",
  customers: "Customers",
  suppliers: "Suppliers",
  users: "User Management",
  sales: "Sales History",
  purchases: "Purchase Orders",
  reports: "Reports & Analytics",
  stores: "Store Management",
  settings: "Settings",
};

interface TopBarProps {
  onMobileMenuOpen?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMobileMenuOpen }) => {
  const { activePage, currentUser, products, currentStoreId } = usePOSStore();
  const lowStock = products.filter(p => p.storeId === currentStoreId && p.stock <= p.lowStockThreshold).length;

  return (
    <header className="h-16 glass-topbar flex items-center px-4 md:px-6 gap-3 sticky top-0 z-30">
      {/* Mobile hamburger */}
      <button
        onClick={onMobileMenuOpen}
        className="md:hidden p-2 rounded-xl hover:bg-indigo-50 text-gray-600 transition flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 truncate">
          {pageTitles[activePage] ?? activePage}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-xl hover:bg-indigo-50 text-gray-500 hover:text-indigo-600 transition">
            <Bell size={18} />
          </button>
          {lowStock > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {lowStock}
            </span>
          )}
        </div>

        {/* User chip */}
        <button className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-indigo-50 transition group">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
            {currentUser?.name?.[0] ?? "U"}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-gray-700 leading-tight">{currentUser?.name}</p>
            <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role?.replace("_", " ")}</p>
          </div>
          <ChevronDown size={13} className="text-gray-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};
