import React, { useState, useMemo } from "react";
import { usePagination } from "../utils/usePagination";
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

  const { currentItems: pagedSales, page, setPage, totalPages, hasNext, hasPrev } = usePagination(filtered, 25);

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
            <button
              key={f.id}
              onClick={() => setDateFilter(f.id)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition duration-150",
                dateFilter === f.id 
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20" 
                  : "glass border border-white/60 text-slate-600 hover:bg-white/40 hover:text-slate-800")}
            >
              {f.label}
            </button>
          ))}
          <select
            value={payFilter}
            onChange={e => setPayFilter(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl text-xs glass-input border border-white/60 text-slate-800 focus:outline-none focus:border-indigo-500/50 bg-transparent font-medium cursor-pointer"
          >
            <option value="all" className="bg-white text-slate-800">All Payments</option>
            <option value="cash" className="bg-white text-slate-800">Cash</option>
            <option value="mobile_money" className="bg-white text-slate-800">Mobile Money</option>
            <option value="card" className="bg-white text-slate-800">Card</option>
          </select>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice..."
            className="pl-9 pr-4 py-2 rounded-xl text-sm w-56 glass-input border border-white/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl border border-white/60 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest">Transactions</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">{filtered.length}</p>
        </div>
        <div className="glass-card rounded-2xl border border-white/60 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest">Total Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">GH₵ {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl border border-white/60 p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest">Avg. Sale</p>
          <p className="text-2xl font-extrabold text-slate-700 mt-0.5">GH₵ {filtered.length ? (totalRevenue / filtered.length).toFixed(2) : "0.00"}</p>
        </div>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 bg-slate-50/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                {isSuperAdmin && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>}
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cashier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {pagedSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-600">{sale.invoiceNo}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-medium">{format(new Date(sale.createdAt), "dd MMM yyyy HH:mm")}</td>
                  {isSuperAdmin && <td className="px-4 py-3 text-xs text-slate-500 font-medium">{storeName(sale.storeId)}</td>}
                  <td className="px-4 py-3 text-xs text-slate-600 font-medium">{userName(sale.userId)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 font-medium">{sale.customerName ?? "Walk-in"}</td>
                  <td className="px-4 py-3 text-xs text-slate-600 font-medium">{sale.items.length} item(s)</td>
                  <td className="px-4 py-3 font-bold text-slate-800">GH₵ {sale.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={sale.paymentMethod === "cash" ? "success" : sale.paymentMethod === "card" ? "info" : "purple"}>
                      {sale.paymentMethod.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewSale(sale)} className="p-1.5 text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition"><Eye size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100/50">
              <p className="text-xs text-slate-500 font-medium">
                Showing {((page - 1) * 25) + 1}–{Math.min(page * 25, filtered.length)} of {filtered.length} sales
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!hasPrev}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >Prev</button>
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-500">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasNext}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >Next</button>
              </div>
            </div>
          )}
          {!filtered.length && (
            <div className="py-16 text-center text-slate-400">
              <Receipt size={40} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">No sales found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Sale Detail Modal */}
      <Modal open={!!viewSale} onClose={() => setViewSale(null)} title={`Sale — ${viewSale?.invoiceNo}`} size="md">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-slate-400/80 text-[10px] font-semibold uppercase tracking-wider">Date</p><p className="font-semibold text-slate-800">{format(new Date(viewSale.createdAt), "dd MMM yyyy HH:mm")}</p></div>
              <div><p className="text-slate-400/80 text-[10px] font-semibold uppercase tracking-wider">Store</p><p className="font-semibold text-slate-800">{storeName(viewSale.storeId)}</p></div>
              <div><p className="text-slate-400/80 text-[10px] font-semibold uppercase tracking-wider">Cashier</p><p className="font-semibold text-slate-800">{userName(viewSale.userId)}</p></div>
              <div><p className="text-slate-400/80 text-[10px] font-semibold uppercase tracking-wider">Customer</p><p className="font-semibold text-slate-800">{viewSale.customerName ?? "Walk-in"}</p></div>
              <div><p className="text-slate-400/80 text-[10px] font-semibold uppercase tracking-wider">Payment</p><Badge variant="info">{viewSale.paymentMethod.replace("_", " ")}</Badge></div>
              <div><p className="text-slate-400/80 text-[10px] font-semibold uppercase tracking-wider">Status</p><Badge variant="success">{viewSale.status}</Badge></div>
            </div>
            <div className="border border-slate-200/50 bg-white/40 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Disc</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {viewSale.items.map((item, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-800 font-medium">{item.productName}</td>
                      <td className="px-3 py-2 text-right text-slate-600 font-medium">{item.qty}</td>
                      <td className="px-3 py-2 text-right text-slate-600 font-medium">GH₵ {item.price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-slate-500 font-semibold">{item.discount > 0 ? `${item.discount}%` : "—"}</td>
                      <td className="px-3 py-2 text-right font-bold text-slate-800">GH₵ {(item.price * item.qty * (1 - item.discount / 100)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-500/10 border border-slate-500/10 rounded-xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600 font-medium"><span>Subtotal</span><span>GH₵ {viewSale.subtotal.toFixed(2)}</span></div>
              {viewSale.discountAmount > 0 && <div className="flex justify-between text-rose-600 font-semibold"><span>Discount</span><span>-GH₵ {viewSale.discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-slate-600 font-medium"><span>Tax</span><span>GH₵ {viewSale.taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-1 border-t border-slate-200"><span>Total</span><span>GH₵ {viewSale.total.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500 font-medium"><span>Amount Paid</span><span>GH₵ {viewSale.amountPaid.toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-500 font-medium"><span>Change</span><span>GH₵ {viewSale.change.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
