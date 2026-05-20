import React, { useMemo, useState } from "react";
import { usePOSStore } from "../store/posStore";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { format, subDays, startOfDay, startOfMonth } from "date-fns";
import { TrendingUp, DollarSign, ShoppingBag, Package } from "lucide-react";
import { cn } from "../utils/cn";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export const ReportsPage: React.FC = () => {
  const { sales, products, stores, currentStoreId, currentUser } = usePOSStore();
  const [period, setPeriod] = useState<"7d" | "30d" | "month">("7d");
  const isSuperAdmin = currentUser?.role === "super_admin";

  const filteredSales = useMemo(() =>
    isSuperAdmin ? sales : sales.filter(s => s.storeId === currentStoreId),
    [sales, currentStoreId, isSuperAdmin]
  );

  const now = new Date();
  const periodStart = period === "7d" ? subDays(now, 7) : period === "30d" ? subDays(now, 30) : startOfMonth(now);
  const periodSales = filteredSales.filter(s => new Date(s.createdAt) >= periodStart);

  // Daily revenue chart
  const days = period === "7d" ? 7 : period === "30d" ? 30 : new Date().getDate();
  const dailyData = useMemo(() => {
    return Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = subDays(now, days - 1 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const daySales = filteredSales.filter(s => { const d = new Date(s.createdAt); return d >= dayStart && d < dayEnd; });
      return {
        day: format(date, days > 14 ? "d" : "EEE d"),
        revenue: parseFloat(daySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        count: daySales.length,
        profit: parseFloat(daySales.reduce((sum, s) => {
          const prodProfit = s.items.reduce((ps, item) => {
            const prod = products.find(p => p.id === item.productId);
            return ps + ((item.price - (prod?.costPrice ?? 0)) * item.qty);
          }, 0);
          return sum + prodProfit;
        }, 0).toFixed(2)),
      };
    });
  }, [filteredSales, days, products]);

  // Top products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    periodSales.forEach(s => {
      s.items.forEach(item => {
        if (!map[item.productId]) map[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        map[item.productId].qty += item.qty;
        map[item.productId].revenue += item.price * item.qty;
      });
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [periodSales]);

  // Payment breakdown
  const paymentBreakdown = useMemo(() => {
    const m: Record<string, number> = { cash: 0, mobile_money: 0, card: 0 };
    periodSales.forEach(s => { m[s.paymentMethod] = (m[s.paymentMethod] || 0) + s.total; });
    return Object.entries(m).map(([k, v]) => ({ name: k.replace("_", " "), value: parseFloat(v.toFixed(2)) })).filter(d => d.value > 0);
  }, [periodSales]);

  // Store comparison (super admin)
  const storeComparison = useMemo(() => {
    return stores.map(store => {
      const storeSales = sales.filter(s => s.storeId === store.id && new Date(s.createdAt) >= periodStart);
      return {
        name: store.name.split(" ")[0],
        revenue: parseFloat(storeSales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        profit: parseFloat(storeSales.reduce((sum, s) => {
          return sum + s.items.reduce((ps, item) => {
            const prod = products.find(p => p.id === item.productId);
            return ps + ((item.price - (prod?.costPrice ?? 0)) * item.qty);
          }, 0);
        }, 0).toFixed(2)),
        count: storeSales.length,
      };
    });
  }, [sales, stores, periodStart, products]);

  const totalRevenue = periodSales.reduce((sum, s) => sum + s.total, 0);
  const totalProfit = dailyData.reduce((sum, d) => sum + d.profit, 0);
  const avgSale = periodSales.length ? totalRevenue / periodSales.length : 0;

  return (
    <div className="space-y-5">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[{ id: "7d", label: "Last 7 Days" }, { id: "30d", label: "Last 30 Days" }, { id: "month", label: "This Month" }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id as any)} className={cn("px-4 py-1.5 rounded-xl text-sm font-medium transition", period === p.id ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `GHS ${totalRevenue.toFixed(2)}`, icon: <DollarSign size={18} />, color: "text-indigo-600 bg-indigo-50" },
          { label: "Gross Profit", value: `GHS ${totalProfit.toFixed(2)}`, icon: <TrendingUp size={18} />, color: "text-emerald-600 bg-emerald-50" },
          { label: "Transactions", value: String(periodSales.length), icon: <ShoppingBag size={18} />, color: "text-amber-600 bg-amber-50" },
          { label: "Avg. Sale Value", value: `GHS ${avgSale.toFixed(2)}`, icon: <Package size={18} />, color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.color.split(" ")[1]}`}>
              <span className={s.color.split(" ")[0]}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Profit Chart */}
      <Card>
        <CardHeader><h3 className="font-semibold text-gray-800">Revenue vs Profit Trend</h3></CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val, name) => [`GHS ${val}`, name === "revenue" ? "Revenue" : "Profit"]} />
              <Legend formatter={v => <span className="text-xs text-gray-600 capitalize">{v}</span>} />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-800">Top Products by Revenue</h3></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" barSize={16}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(val) => [`GHS ${val}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-800">Payment Methods</h3></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentBreakdown} cx="50%" cy="50%" outerRadius={85} dataKey="value" paddingAngle={3}>
                  {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(val) => [`GHS ${val}`, ""]} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs text-gray-600 capitalize">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Store Comparison (super admin) */}
      {isSuperAdmin && (
        <Card>
          <CardHeader><h3 className="font-semibold text-gray-800">Store Performance Comparison</h3></CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left">
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Store</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Transactions</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Profit</th>
                    <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {storeComparison.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-800">{s.name}</td>
                      <td className="py-3 text-right text-gray-600">{s.count}</td>
                      <td className="py-3 text-right font-semibold text-gray-800">GHS {s.revenue.toFixed(2)}</td>
                      <td className="py-3 text-right text-emerald-600 font-medium">GHS {s.profit.toFixed(2)}</td>
                      <td className="py-3 text-right text-gray-500">{s.revenue ? ((s.profit / s.revenue) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader><h3 className="font-semibold text-gray-800">Daily Transactions Summary</h3></CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Sales</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Revenue</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase text-right">Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dailyData.slice(-10).reverse().map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="py-2.5 text-gray-700">{d.day}</td>
                    <td className="py-2.5 text-right text-gray-600">{d.count}</td>
                    <td className="py-2.5 text-right font-medium text-gray-800">GHS {d.revenue.toFixed(2)}</td>
                    <td className="py-2.5 text-right text-emerald-600">GHS {d.profit.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
