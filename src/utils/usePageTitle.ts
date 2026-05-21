import { useEffect } from "react";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  pos: "POS Terminal",
  products: "Products",
  categories: "Categories",
  inventory: "Stock Logs",
  customers: "Customers",
  suppliers: "Suppliers",
  users: "Users",
  sales: "Sales History",
  purchases: "Purchase Orders",
  reports: "Reports",
  stores: "Stores",
  settings: "Settings",
};

export function usePageTitle(page: string) {
  useEffect(() => {
    const title = PAGE_TITLES[page] ?? page;
    document.title = `${title} — MultiPOS`;
  }, [page]);
}
