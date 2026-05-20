import React from "react";
import { Bell, ChevronDown } from "lucide-react";
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

export const TopBar: React.FC = () => {
  const { activePage, currentUser, products, currentStoreId } = usePOSStore();
  const lowStock = products.filter(p => p.storeId === currentStoreId && p.stock <= p.lowStockThreshold).length;

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center px-6 gap-4 sticky top-0 z-30 shadow-sm">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-800">{pageTitles[activePage] ?? activePage}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
            <Bell size={18} />
          </button>
          {lowStock > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {lowStock}
            </span>
          )}
        </div>

        {/* User */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition">
          <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
            {currentUser?.name?.[0] ?? "U"}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{currentUser?.name}</p>
            <p className="text-[10px] text-gray-400 capitalize">{currentUser?.role?.replace("_", " ")}</p>
          </div>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
};
