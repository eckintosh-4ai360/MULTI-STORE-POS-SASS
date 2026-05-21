import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { usePOSStore } from "./store/posStore";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { Dashboard } from "./views/Dashboard";
import { POSPage } from "./views/POSPage";
import { ProductsPage } from "./views/ProductsPage";
import { CategoriesPage } from "./views/CategoriesPage";
import { CustomersPage } from "./views/CustomersPage";
import { SalesPage } from "./views/SalesPage";
import { ReportsPage } from "./views/ReportsPage";
import { StoresPage } from "./views/StoresPage";
import { UsersPage } from "./views/UsersPage";
import { SuppliersPage } from "./views/SuppliersPage";
import { InventoryPage } from "./views/InventoryPage";
import { SettingsPage } from "./views/SettingsPage";
import { cn } from "./utils/cn";
import { AlertCircle, RefreshCw } from "lucide-react";
import { usePageTitle } from "./utils/usePageTitle";

const pages: Record<string, React.ReactNode> = {
  dashboard: <Dashboard />,
  pos: <POSPage />,
  products: <ProductsPage />,
  categories: <CategoriesPage />,
  inventory: <InventoryPage />,
  customers: <CustomersPage />,
  suppliers: <SuppliersPage />,
  users: <UsersPage />,
  sales: <SalesPage />,
  reports: <ReportsPage />,
  stores: <StoresPage />,
  settings: <SettingsPage />,
  purchases: <SettingsPage />,
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl border border-white/60 p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl border border-white/60 h-64 lg:col-span-2" />
        <div className="glass-card rounded-2xl border border-white/60 h-64" />
      </div>
      <div className="glass-card rounded-2xl border border-white/60 h-48" />
    </div>
  );
}

export default function App() {
  const { currentUser, activePage, sidebarOpen, fetchData, isLoading, dataError, stores, _hasHydrated } = usePOSStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  usePageTitle(activePage);

  // Fetch org data once on mount (only if logged in and store not yet hydrated)
  // Must be called before any early returns (Rules of Hooks)
  React.useEffect(() => {
    if (_hasHydrated && currentUser && stores.length === 0) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated, currentUser]);

  // Wait for Zustand to read from localStorage before deciding where to go
  if (!_hasHydrated) return null;

  // Not logged in — redirect to /login
  if (!currentUser) {
    if (typeof window !== "undefined") window.location.replace("/login");
    return null;
  }

  const isPOS = activePage === "pos";

  return (
    <div className="min-h-screen flex relative" style={{ zIndex: 1 }}>
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        sidebarOpen ? "md:ml-64" : "md:ml-16"
      )}>
        <TopBar onMobileMenuOpen={() => setMobileMenuOpen(true)} />
        <main className={cn("flex-1 overflow-auto", isPOS ? "p-2 md:p-4" : "p-3 md:p-6")}>
          {dataError && (
            <div className="mb-4 flex items-center gap-3 bg-red-50/80 border border-red-200/60 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">{dataError}</span>
              <button
                onClick={() => fetchData()}
                className="flex items-center gap-1.5 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-xl text-xs font-semibold transition"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}
          <div className={cn(isPOS ? "h-full flex flex-col" : "animate-fadeIn")}>
            {isLoading && activePage === "dashboard" ? (
              <LoadingSkeleton />
            ) : (
              pages[activePage] ?? <div className="text-center py-20 text-slate-500 font-medium">Page not found</div>
            )}
          </div>
        </main>
      </div>
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-semibold', style: { borderRadius: '14px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(31,38,135,0.08)' } }} />
    </div>
  );
}
