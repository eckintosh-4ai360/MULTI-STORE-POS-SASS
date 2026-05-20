import React from "react";
import { usePOSStore } from "./store/posStore";
import { LoginPage } from "./views/LoginPage";
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
};

export default function App() {
  const { currentUser, activePage, sidebarOpen } = usePOSStore();

  if (!currentUser) {
    return <LoginPage />;
  }

  const isPOS = activePage === "pos";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", sidebarOpen ? "ml-64" : "ml-16")}>
        <TopBar />
        <main className={cn("flex-1 overflow-auto", isPOS ? "p-4" : "p-6")}>
          <div className={cn(isPOS ? "h-full flex flex-col" : "")}>
            {pages[activePage] ?? <div className="text-center py-20 text-gray-400">Page not found</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
