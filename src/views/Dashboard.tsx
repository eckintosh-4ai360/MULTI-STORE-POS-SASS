import React, { useMemo } from "react";
import { usePOSStore } from "../store/posStore";
import { StatCard } from "../components/ui/StatCard";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import {
  ShoppingBag, Package, AlertTriangle,
  Users, Store, CalendarDays, ChevronRight, CircleDollarSign,
  Plus, Sparkles, TrendingUp
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
  const yesterday = subDays(today, 1);
  const todaySales = filteredSales.filter(s => new Date(s.createdAt) >= today);
  const yesterdaySales = filteredSales.filter(s => {
    const d = new Date(s.createdAt);
    return d >= yesterday && d < today;
  });
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const yesterdayRevenue = yesterdaySales.reduce((sum, s) => sum + s.total, 0);
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);

  // Real trend percentages
  const revenueTrend = yesterdayRevenue > 0
    ? parseFloat(((todayRevenue - yesterdayRevenue) / yesterdayRevenue * 100).toFixed(1))
    : todayRevenue > 0 ? 100 : 0;
  const salesTorend = yesterdaySales.length > 0
    ? parseFloat(((todaySales.length - yesterdaySales.length) / yesterdaySales.length * 100).toFixed(1))
    : todaySales.length > 0 ? 100 : 0;
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
  const activeStore = stores.find(store => store.id === currentStoreId);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-4">
      <section className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/65 px-5 py-5 shadow-[0_12px_30px_rgba(73,78,163,0.07)] backdrop-blur-xl md:px-7 md:py-6">
        <div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-indigo-200/30 blur-2xl" />
        <div className="absolute right-28 bottom-[-100px] h-40 w-40 rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-500">
              <Sparkles size={14} /> Business overview
            </div>
            <h2 className="text-2xl font-black tracking-[-0.035em] text-slate-950 md:text-3xl">
              {greeting}, {currentUser?.name?.split(" ")[0] ?? "there"}.
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {activeStore ? `${activeStore.name} is ready for business.` : "Here’s how your business is performing today."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-white/80 px-3.5 py-2.5 text-xs font-semibold text-slate-500 shadow-sm">
              <CalendarDays size={15} className="text-indigo-500" />
              {format(new Date(), "EEEE, MMM d")}
            </div>
            <Button size="sm" icon={<Plus size={15} />} onClick={() => setActivePage("pos")}>New sale</Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Today’s revenue" value={`GH₵ ${todayRevenue.toFixed(2)}`} icon={<CircleDollarSign size={21} />} color="indigo" trend={revenueTrend} subtitle="Compared with yesterday" />
        <StatCard title="Completed sales" value={String(todaySales.length)} icon={<ShoppingBag size={21} />} color="cyan" trend={salesTorend} subtitle="Transactions recorded today" />
        <StatCard title="Low stock items" value={String(lowStockItems.length)} icon={<AlertTriangle size={21} />} color="amber" trend={lowStockItems.length ? -Math.min(lowStockItems.length * 5, 100) : 0} subtitle={lowStockItems.length ? "Products need attention" : "Inventory looks healthy"} />
        <StatCard title={isSuperAdmin ? "Total customers" : "Store customers"} value={String(filteredCustomers.length)} icon={<Users size={21} />} color="purple" trend={5} subtitle="Registered customers" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 overflow-hidden border border-white/80 shadow-[0_12px_30px_rgba(73,78,163,0.08)]">
          <CardHeader className="border-slate-100/80 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-500">Performance</p>
                <h3 className="mt-1 font-bold text-slate-900">Revenue overview</h3>
              </div>
              <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">GH₵ {totalRevenue.toFixed(2)} total</span>
            </div>
          </CardHeader>
          <CardBody className="pt-5">
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
                <Tooltip formatter={(val) => [`GH₵ ${val}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Payment Breakdown */}
        <Card className="overflow-hidden border border-white/80 shadow-[0_12px_30px_rgba(73,78,163,0.08)]">
          <CardHeader className="border-slate-100/80 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-500">Collections</p>
            <h3 className="mt-1 font-bold text-slate-900">Payment methods</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {paymentData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => [`GH₵ ${val}`, ""]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Store Comparison (Super Admin) */}
      {isSuperAdmin && (
        <Card className="overflow-hidden border border-white/80 shadow-[0_12px_30px_rgba(73,78,163,0.08)]">
          <CardHeader className="border-slate-100/80 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-500">All locations</p>
                <h3 className="mt-1 font-bold text-slate-900">Store revenue comparison</h3>
              </div>
              <Button variant="ghost" size="sm" icon={<Store size={14} />} onClick={() => setActivePage("stores")}>Manage Stores</Button>
            </div>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={storeData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(val) => [`GH₵ ${val}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card className="overflow-hidden border border-white/80 shadow-[0_12px_30px_rgba(73,78,163,0.08)]">
          <CardHeader className="border-slate-100/80 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-500">Live activity</p>
                <h3 className="mt-1 font-bold text-slate-900">Recent sales</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActivePage("sales")}>View all <ChevronRight size={15} /></Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {recentSales.map(sale => (
                <div key={sale.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-indigo-50/40 md:px-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-500"><TrendingUp size={16} /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sale.invoiceNo}</p>
                      <p className="text-xs text-gray-400">{format(new Date(sale.createdAt), "MMM d, h:mm a")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">GH₵ {sale.total.toFixed(2)}</p>
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
        <Card className="overflow-hidden border border-white/80 shadow-[0_12px_30px_rgba(73,78,163,0.08)]">
          <CardHeader className="border-slate-100/80 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-500">Inventory health</p>
                <h3 className="mt-1 font-bold text-slate-900">Low stock alerts</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setActivePage("products")}>View products <ChevronRight size={15} /></Button>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-50">
              {lowStockItems.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-amber-50/45 md:px-6">
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
