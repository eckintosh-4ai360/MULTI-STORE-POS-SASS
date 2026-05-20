import React, { useState, useMemo } from "react";
import { usePOSStore } from "../store/posStore";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Search, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, ShoppingCart } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../utils/cn";

const typeIcons = {
  IN: <ArrowDownCircle size={14} className="text-emerald-500" />,
  OUT: <ArrowUpCircle size={14} className="text-red-500" />,
  TRANSFER: <ArrowLeftRight size={14} className="text-blue-500" />,
  SALE: <ShoppingCart size={14} className="text-indigo-500" />,
};

const typeBadge: Record<string, "success" | "danger" | "info" | "purple"> = {
  IN: "success",
  OUT: "danger",
  TRANSFER: "info",
  SALE: "purple",
};

export const InventoryPage: React.FC = () => {
  const { inventoryLogs, stores, currentStoreId, currentUser } = usePOSStore();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const isSuperAdmin = currentUser?.role === "super_admin";

  const filtered = useMemo(() => {
    let logs = isSuperAdmin ? inventoryLogs : inventoryLogs.filter(l => l.storeId === currentStoreId);
    if (search) logs = logs.filter(l => l.productName.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== "all") logs = logs.filter(l => l.type === typeFilter);
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inventoryLogs, currentStoreId, isSuperAdmin, search, typeFilter]);

  const storeName = (id: string) => stores.find(s => s.id === id)?.name ?? id;

  const summary = useMemo(() => {
    const logs = isSuperAdmin ? inventoryLogs : inventoryLogs.filter(l => l.storeId === currentStoreId);
    return {
      in: logs.filter(l => l.type === "IN").reduce((s, l) => s + l.qty, 0),
      out: logs.filter(l => l.type === "OUT").reduce((s, l) => s + l.qty, 0),
      transfers: logs.filter(l => l.type === "TRANSFER").reduce((s, l) => s + l.qty, 0),
      sales: logs.filter(l => l.type === "SALE").reduce((s, l) => s + l.qty, 0),
    };
  }, [inventoryLogs, currentStoreId, isSuperAdmin]);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Stock Received", value: summary.in, icon: <ArrowDownCircle size={18} />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Stock Removed", value: summary.out, icon: <ArrowUpCircle size={18} />, color: "text-red-500 bg-red-50" },
          { label: "Transferred", value: summary.transfers, icon: <ArrowLeftRight size={18} />, color: "text-blue-600 bg-blue-50" },
          { label: "Units Sold", value: summary.sales, icon: <ShoppingCart size={18} />, color: "text-indigo-600 bg-indigo-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color.split(" ")[1]}`}>
              <span className={s.color.split(" ")[0]}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-800">{s.value} units</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "IN", "OUT", "TRANSFER", "SALE"].map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition",
                typeFilter === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
            >
              {f === "all" ? "All Movements" : f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search product..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56" />
        </div>
      </div>

      {/* Log Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Quantity</th>
                {isSuperAdmin && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Store</th>}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 text-xs text-gray-500">{format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{log.productName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {typeIcons[log.type as keyof typeof typeIcons]}
                      <Badge variant={typeBadge[log.type]}>{log.type}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("font-semibold", log.type === "IN" || log.type === "TRANSFER" ? "text-emerald-600" : "text-red-500")}>
                      {log.type === "IN" || log.type === "TRANSFER" ? "+" : "-"}{log.qty}
                    </span>
                  </td>
                  {isSuperAdmin && <td className="px-4 py-3 text-xs text-gray-500">{storeName(log.storeId)}</td>}
                  <td className="px-4 py-3 text-xs text-gray-400">{log.note ?? "—"}</td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="py-16 text-center text-gray-400 text-sm">
                    <ArrowLeftRight size={36} className="mx-auto mb-2 opacity-40" />
                    No inventory movements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
