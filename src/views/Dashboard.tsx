import React, { useMemo } from "react";
import { usePOSStore } from "../store/posStore";
import { StatCard } from "../components/ui/StatCard";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  DollarSign, ShoppingBag, Package, AlertTriangle,
  Users, Store, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Button } from "../components/ui/Button";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

export const Dashboard: React.FC = () => {
  const { sales, products, customers, stores, currentUser, currentStoreId, setActivePage } = usePOSStore();

  const isSuperAdmin = currentUser?.role === "super_admin";

  const filteredSales = useMemo(() =>
    isSuperAdmin ? sales : sales.filter(s => s.storeId === currentStoreId),
    [sales, currentStoreId, isSuperAdmin]
  );

  const filteredProducts = useMemo(() =>
    isSuperAdmin ? products : products.filter(p => p.storeId === currentStoreId),
    [products, currentStoreId, isSuperAdmin]
  );

  const filteredCustomers = useMemo(() =>
    isSuperAdmin ? customers : customers.filter(c => c.storeId === currentStoreId),
    [customers, currentStoreId, isSuperAdmin]
  );

  const today = startOfDay(new Date());
  const todaySales = filteredSales.filter(s => new Date(s.createdAt) >= today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const lowStockItems = filteredProducts.filter(p => p.stock <= p.lowStockThreshold);

  // 7-day chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const daySales = filteredSales.filter(s => {
        const d = new Date(s.createdAt);
        return d >= dayStart && d < dayEnd;
      });
      return {
        day: format(date, "EEE"),
        revenue: parseFloat(daySales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        transactions: daySales.length,
      };
    });
  }, [filteredSales]);

  // Payment method breakdown
  const paymentData = useMemo(() => {
    const counts: Record<string, number> = { cash: 0, mobile_money: 0, card: 0 };
    filteredSales.forEach(s => { counts[s.paymentMethod] = (counts[s.paymentMethod] || 0) + s.total; });
    return [
      { name: "Cash", value: parseFloat(counts.cash.toFixed(2)) },
      { name: "Mobile Money", value: parseFloat(counts.mobile_money.toFixed(2)) },
      { name: "Card", value: parseFloat(counts.card.toFixed(2)) },
    ].filter(d => d.value > 0);
  }, [filteredSales]);

  // Per-store breakdown (super admin only)
  const storeData = useMemo(() => {
    return stores.map(store => {
      const storeSales = sales.filter(s => s.storeId === store.id);
      return {
        name: store.name.split(" ")[0],
        revenue: parseFloat(storeSales.reduce((sum, s) => sum + s.total, 0).toFixed(2)),
        transactions: storeSales.length,
      };
    });
  }, [sales, stores]);

  const recentSales = filteredSales.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Revenue" value={`GHS ${todayRevenue.toFixed(2)}`} icon={<DollarSign size={20} />} color="indigo" trend={12.5} subtitle="vs yesterday" />
        <StatCard title="Today's Sales" value={String(todaySales.length)} icon={<ShoppingBag size={20} />} color="emerald" trend={8.2} subtitle="transactions" />
        <StatCard title="Low Stock Alerts" value={String(lowStockItems.length)} icon={<AlertTriangle size={20} />} color="amber" subtitle="items need restock" />
        <StatCard title={isSuperAdmin ? "Total Customers" : "Store Customers"} value={String(filteredCustomers.length)} icon={<Users size={20} />} color="purple" trend={5} subtitle="registered" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Revenue (Last 7 Days)</h3>
              <span className="text-sm text-gray-500">GHS {totalRevenue.toFixed(2)} total</span>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`GHS ${val}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-800">Payment Methods</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => [`GHS ${val}`, ""]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Store Comparison (Super Admin) */}
      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Store Revenue Comparison</h3>
              <Button variant="ghost" size="sm" icon={<Store size={14} />} onClick={() => setActivePage("stores")}>Manage Stores</Button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={storeData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`GHS ${val}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Recent Sales</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePage("sales")}>View All <ArrowRight size={14} /></Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {recentSales.map(sale => (
                <div key={sale.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{sale.invoiceNo}</p>
                    <p className="text-xs text-gray-400">{format(new Date(sale.createdAt), "MMM d, h:mm a")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">GHS {sale.total.toFixed(2)}</p>
                    <Badge variant={sale.paymentMethod === "cash" ? "success" : sale.paymentMethod === "card" ? "info" : "purple"}>
                      {sale.paymentMethod.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
              {!recentSales.length && <p className="px-6 py-8 text-sm text-gray-400 text-center">No sales yet today</p>}
            </div>
          </CardBody>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Low Stock Alerts</h3>
              <Button variant="ghost" size="sm" onClick={() => setActivePage("products")}>View Products <ArrowRight size={14} /></Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {lowStockItems.slice(0, 5).map(p => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{p.name}</p>
                    <p className="text-xs text-gray-400">Threshold: {p.lowStockThreshold} units</p>
                  </div>
                  <Badge variant={p.stock === 0 ? "danger" : p.stock < 5 ? "warning" : "neutral"}>
                    {p.stock} left
                  </Badge>
                </div>
              ))}
              {!lowStockItems.length && (
                <div className="px-6 py-8 text-center">
                  <Package size={32} className="text-green-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">All stock levels are good</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
