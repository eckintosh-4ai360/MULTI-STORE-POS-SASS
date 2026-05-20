import React, { useState, useMemo } from "react";
import { usePOSStore, Sale } from "../store/posStore";
import { Search, Receipt, Eye } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { format } from "date-fns";
import { cn } from "../utils/cn";

export const SalesPage: React.FC = () => {
  const { sales, stores, users, currentStoreId, currentUser } = usePOSStore();
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  const isSuperAdmin = currentUser?.role === "super_admin";

  const filtered = useMemo(() => {
    let list = isSuperAdmin ? sales : sales.filter(s => s.storeId === currentStoreId);
    if (search) list = list.filter(s => s.invoiceNo.toLowerCase().includes(search.toLowerCase()) || s.customerName?.toLowerCase().includes(search.toLowerCase()));
    if (payFilter !== "all") list = list.filter(s => s.paymentMethod === payFilter);
    if (dateFilter === "today") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      list = list.filter(s => new Date(s.createdAt) >= today);
    } else if (dateFilter === "week") {
      const week = new Date(); week.setDate(week.getDate() - 7);
      list = list.filter(s => new Date(s.createdAt) >= week);
    } else if (dateFilter === "month") {
      const month = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);
      list = list.filter(s => new Date(s.createdAt) >= month);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sales, currentStoreId, isSuperAdmin, search, payFilter, dateFilter]);

  const totalRevenue = filtered.reduce((sum, s) => sum + s.total, 0);

  const storeName = (id: string) => stores.find(s => s.id === id)?.name ?? id;
  const userName = (id: string) => users.find(u => u.id === id)?.name ?? "Unknown";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "This Week" },
            { id: "month", label: "This Month" },
          ].map(f => (
            <button key={f.id} onClick={() => setDateFilter(f.id)} className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition", dateFilter === f.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              {f.label}
            </button>
          ))}
          <select value={payFilter} onChange={e => setPayFilter(e.target.value)} className="px-3 py-1.5 rounded-xl text-xs border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-400">
            <option value="all">All Payments</option>
            <option value="cash">Cash</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
          </select>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoice..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56" />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-indigo-600">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-600">GHS {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500">Avg. Sale</p>
          <p className="text-2xl font-bold text-gray-700">GHS {filtered.length ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}</p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                {isSuperAdmin && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Store</th>}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Cashier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-600">{sale.invoiceNo}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{format(new Date(sale.createdAt), "dd MMM yyyy HH:mm")}</td>
                  {isSuperAdmin && <td className="px-4 py-3 text-xs text-gray-500">{storeName(sale.storeId)}</td>}
                  <td className="px-4 py-3 text-xs text-gray-600">{userName(sale.userId)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{sale.customerName ?? "Walk-in"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{sale.items.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">GHS {sale.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={sale.paymentMethod === "cash" ? "success" : sale.paymentMethod === "card" ? "info" : "purple"}>
                      {sale.paymentMethod.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewSale(sale)} className="p-1.5 text-indigo-400 hover:bg-indigo-50 rounded-lg transition"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="py-16 text-center text-gray-400">
              <Receipt size={40} className="mx-auto mb-2 opacity-40" />
              <p>No sales found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Sale Detail Modal */}
      <Modal open={!!viewSale} onClose={() => setViewSale(null)} title={`Sale — ${viewSale?.invoiceNo}`} size="md">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">Date</p><p className="font-medium">{format(new Date(viewSale.createdAt), "dd MMM yyyy HH:mm")}</p></div>
              <div><p className="text-gray-400 text-xs">Store</p><p className="font-medium">{storeName(viewSale.storeId)}</p></div>
              <div><p className="text-gray-400 text-xs">Cashier</p><p className="font-medium">{userName(viewSale.userId)}</p></div>
              <div><p className="text-gray-400 text-xs">Customer</p><p className="font-medium">{viewSale.customerName ?? "Walk-in"}</p></div>
              <div><p className="text-gray-400 text-xs">Payment</p><Badge variant="info">{viewSale.paymentMethod.replace("_", " ")}</Badge></div>
              <div><p className="text-gray-400 text-xs">Status</p><Badge variant="success">{viewSale.status}</Badge></div>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Disc</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {viewSale.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{item.productName}</td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2 text-right">GHS {item.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{item.discount > 0 ? `${item.discount}%` : "—"}</td>
                      <td className="px-3 py-2 text-right font-medium">GHS {(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>GHS {viewSale.subtotal.toFixed(2)}</span></div>
              {viewSale.discountAmount > 0 && <div className="flex justify-between text-red-500"><span>Discount</span><span>-GHS {viewSale.discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>GHS {viewSale.taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1 border-t border-gray-200"><span>Total</span><span>GHS {viewSale.total.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Amount Paid</span><span>GHS {viewSale.amountPaid.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Change</span><span>GHS {viewSale.change.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
