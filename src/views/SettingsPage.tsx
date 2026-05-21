import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import { Store, Bell, Shield, Palette, Database, CheckCircle, CreditCard, Zap, TrendingUp } from "lucide-react";
import { Input, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { PLAN_LIMITS, getPlanLabel, getPlanColor } from "../utils/planLimits";


export const SettingsPage: React.FC = () => {
  const { stores, users, products, updateStore, currentStoreId, currentUser, subscription } = usePOSStore();
  const store = stores.find(s => s.id === currentStoreId);
  const orgStores = stores;
  const orgUsers = users;
  const storeProducts = products.filter(p => p.storeId === currentStoreId);

  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: store?.name ?? "",
    location: store?.location ?? "",
    currency: store?.currency ?? "GHS",
    taxRate: store?.taxRate ?? 15,
    receiptHeader: store?.receiptHeader ?? "",
    receiptFooter: store?.receiptFooter ?? "",
  });

  const handleSave = () => {
    if (store) {
      updateStore(store.id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const sections = [
    { id: "store", label: "Store Settings", icon: Store },
    { id: "receipt", label: "Receipt Config", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "data", label: "Data & Backup", icon: Database },
    ...(currentUser?.role === "super_admin" ? [{ id: "billing", label: "Billing", icon: CreditCard }] : []),
  ];


  const [activeSection, setActiveSection] = useState("store");

  return (
    <div className="flex gap-6">
      {/* Settings Sidebar */}
      <div className="w-48 flex-shrink-0">
        <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-2 space-y-0.5">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition font-semibold duration-150 ${activeSection === id ? "bg-indigo-500/10 text-indigo-700 font-bold" : "text-slate-600 hover:bg-white/40 hover:text-slate-800"}`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1">
        {activeSection === "store" && (
          <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Store Settings</h2>
              <p className="text-sm text-slate-500 mt-0.5">Configure your store's basic information</p>
            </div>
            <div className="space-y-4">
              <Input label="Store Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Currency"
                  value={form.currency}
                  onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  options={[
                    { value: "GHS", label: "GHS — Ghanaian Cedi" },
                    { value: "USD", label: "USD — US Dollar" },
                    { value: "EUR", label: "EUR — Euro" },
                    { value: "NGN", label: "NGN — Nigerian Naira" },
                  ]}
                />
                <Input label="Tax Rate (%)" type="number" value={form.taxRate || ""} onChange={e => setForm(f => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} icon={saved ? <CheckCircle size={16} /> : undefined}>
                {saved ? "Saved!" : "Save Changes"}
              </Button>
              {saved && <span className="text-sm font-semibold text-emerald-600 animate-fadeIn">Settings updated successfully</span>}
            </div>
          </div>
        )}

        {activeSection === "receipt" && (
          <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Receipt Configuration</h2>
              <p className="text-sm text-slate-500 mt-0.5">Customize your receipt template</p>
            </div>
            <div className="space-y-4">
              <Input label="Receipt Header" value={form.receiptHeader} onChange={e => setForm(f => ({ ...f, receiptHeader: e.target.value }))} placeholder="Thank you for shopping with us!" />
              <Input label="Receipt Footer" value={form.receiptFooter} onChange={e => setForm(f => ({ ...f, receiptFooter: e.target.value }))} placeholder="Visit us again!" />
            </div>
            {/* Receipt Preview */}
            <div>
              <p className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest mb-2">Preview</p>
              <div className="bg-slate-500/5 border border-dashed border-slate-300 rounded-xl p-4 font-mono text-xs max-w-xs text-slate-800">
                <p className="text-center font-bold">{form.name || "Store Name"}</p>
                <p className="text-center text-slate-400 text-[10px]">{form.location || "Location"}</p>
                <p className="text-center text-slate-400 text-[10px]">{form.receiptHeader || "Header text"}</p>
                <div className="border-t border-dashed my-2 border-slate-300" />
                <p className="text-center text-slate-400">[Sale Items Here]</p>
                <div className="border-t border-dashed my-2 border-slate-300" />
                <p className="text-center font-bold">TOTAL: {form.currency} 0.00</p>
                <div className="border-t border-dashed my-2 border-slate-300" />
                <p className="text-center text-slate-400 text-[10px]">{form.receiptFooter || "Footer text"}</p>
              </div>
            </div>
            <Button onClick={handleSave}>Save Receipt Settings</Button>
          </div>
        )}

        {activeSection === "security" && (
          <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Security Settings</h2>
              <p className="text-sm text-slate-500">Manage authentication and access control</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Role-based Access Control", desc: "Users can only access features for their role", enabled: true },
                { label: "Session Timeout", desc: "Auto-logout after 8 hours of inactivity", enabled: true },
                { label: "Activity Logging", desc: "Log all user actions for audit trail", enabled: true },
                { label: "Two-Factor Authentication", desc: "Require 2FA for admin accounts", enabled: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-white/40 border border-slate-200/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition ${item.enabled ? "bg-indigo-600" : "bg-slate-300"} relative cursor-pointer`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Notification Preferences</h2>
              <p className="text-sm text-slate-500">Configure when to receive alerts</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Low Stock Alerts", desc: "Notify when product stock falls below threshold", enabled: true },
                { label: "New Sale Notifications", desc: "Alert when a sale is completed", enabled: false },
                { label: "Daily Sales Summary", desc: "Receive daily report at end of business", enabled: true },
                { label: "Expiry Date Alerts", desc: "Warn when products are about to expire", enabled: true },
                { label: "Purchase Order Updates", desc: "Notify on order status changes", enabled: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-white/40 border border-slate-200/50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition ${item.enabled ? "bg-indigo-600" : "bg-slate-300"} relative cursor-pointer`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "data" && (
          <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-slate-800 text-lg">Data & Backup</h2>
              <p className="text-sm text-slate-500">Manage your data exports and backups</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Export Sales (CSV)", icon: "📊", desc: "Download all sales data" },
                { label: "Export Products (CSV)", icon: "📦", desc: "Download product catalog" },
                { label: "Export Customers (CSV)", icon: "👥", desc: "Download customer list" },
                { label: "Export Inventory Log", icon: "📋", desc: "Download stock movements" },
                { label: "Backup All Data", icon: "💾", desc: "Full system backup as JSON" },
                { label: "Import Products (CSV)", icon: "⬆️", desc: "Bulk import products" },
              ].map(item => (
                <button key={item.label} className="flex items-center gap-3 p-4 bg-white/40 hover:bg-indigo-500/10 border border-slate-200/50 hover:border-indigo-200 rounded-xl transition text-left">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-sm text-amber-800"><strong>Note:</strong> In this demo, export functions simulate file downloads. In production, these connect to your API endpoints.</p>
            </div>
          </div>
        )}
        {activeSection === "billing" && currentUser?.role === "super_admin" && (() => {
          const plan = (subscription?.plan ?? "starter") as "starter" | "pro" | "enterprise";
          const limits = PLAN_LIMITS[plan];
          const planLabel = getPlanLabel(plan);
          const planColorMap: Record<string, string> = { indigo: "text-indigo-600 bg-indigo-50 border-indigo-200", purple: "text-purple-600 bg-purple-50 border-purple-200", amber: "text-amber-600 bg-amber-50 border-amber-200" };
          const planColor = planColorMap[getPlanColor(plan)] ?? planColorMap.indigo;

          const statusColorMap: Record<string, string> = {
            trialing: "text-blue-600 bg-blue-50 border-blue-200",
            active: "text-emerald-600 bg-emerald-50 border-emerald-200",
            past_due: "text-red-600 bg-red-50 border-red-200",
            canceled: "text-slate-600 bg-slate-50 border-slate-200",
          };
          const statusColor = statusColorMap[subscription?.status ?? "trialing"] ?? statusColorMap.trialing;

          const handleUpgrade = async (targetPlan: string) => {
            try {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}) },
                body: JSON.stringify({ plan: targetPlan }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            } catch (e) { console.error(e); }
          };

          const handlePortal = async () => {
            try {
              const res = await fetch("/api/stripe/portal", {
                method: "POST",
                headers: { ...(currentUser?.id ? { "x-user-id": currentUser.id } : {}) },
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            } catch (e) { console.error(e); }
          };

          return (
            <div className="space-y-5">
              {/* Plan card */}
              <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="font-semibold text-slate-800 text-lg">Subscription</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your plan and billing</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${planColor}`}>{planLabel} Plan</span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full border capitalize ${statusColor}`}>{subscription?.status ?? "trialing"}</span>
                  </div>
                </div>

                {subscription?.trialEnd && subscription.status === "trialing" && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50/80 border border-blue-200/60 rounded-xl text-blue-700 text-sm font-medium mb-5">
                    <Zap size={14} className="flex-shrink-0" />
                    Trial ends {new Date(subscription.trialEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}
                {subscription?.currentPeriodEnd && subscription.status === "active" && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-xl text-emerald-700 text-sm font-medium mb-5">
                    <CheckCircle size={14} className="flex-shrink-0" />
                    Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                )}

                {/* Usage meters */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Stores", used: orgStores.length, limit: limits.stores },
                    { label: "Staff Users", used: orgUsers.length, limit: limits.users },
                    { label: "Products", used: storeProducts.length, limit: limits.products },
                  ].map(m => {
                    const pct = m.limit === Infinity ? 10 : Math.min(100, Math.round((m.used / m.limit) * 100));
                    const isNear = pct >= 80 && m.limit !== Infinity;
                    return (
                      <div key={m.label} className="p-4 bg-white/40 border border-slate-200/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-600">{m.label}</span>
                          <span className={`text-xs font-bold ${isNear ? "text-red-600" : "text-slate-400"}`}>
                            {m.used}/{m.limit === Infinity ? "∞" : m.limit}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isNear ? "bg-red-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-3">
                  {subscription?.status !== "active" || plan !== "enterprise" ? (
                    <Button onClick={() => handleUpgrade(plan === "starter" ? "pro" : "enterprise")} icon={<TrendingUp size={15} />}>
                      Upgrade to {plan === "starter" ? "Pro" : "Enterprise"}
                    </Button>
                  ) : null}
                  {subscription?.stripeCustomerId && (
                    <Button variant="secondary" onClick={handlePortal} icon={<CreditCard size={15} />}>Manage Billing</Button>
                  )}
                </div>
              </div>

              {/* Plan comparison */}
              <div className="glass-card rounded-2xl border border-white/60 shadow-sm p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Available Plans</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(["starter", "pro", "enterprise"] as const).map(p => {
                    const lim = PLAN_LIMITS[p];
                    const prices: Record<string, number> = { starter: 29, pro: 79, enterprise: 199 };
                    const isCurrent = plan === p;
                    return (
                      <div key={p} className={`p-4 rounded-2xl border-2 ${isCurrent ? "border-indigo-400 bg-indigo-50/50" : "border-slate-100"}`}>
                        <p className="font-bold text-slate-800 text-sm capitalize mb-1">{getPlanLabel(p)}</p>
                        <p className="text-2xl font-black text-slate-900">${prices[p]}<span className="text-xs text-slate-400 font-normal">/mo</span></p>
                        <ul className="mt-3 space-y-1 text-xs text-slate-500">
                          <li>{lim.stores === Infinity ? "Unlimited" : lim.stores} store{lim.stores !== 1 ? "s" : ""}</li>
                          <li>{lim.users === Infinity ? "Unlimited" : lim.users} users</li>
                          <li>{lim.products === Infinity ? "Unlimited" : lim.products} products</li>
                        </ul>
                        {!isCurrent && (
                          <button onClick={() => handleUpgrade(p)} className="mt-3 w-full text-xs font-bold py-1.5 px-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition">
                            Switch
                          </button>
                        )}
                        {isCurrent && <p className="mt-3 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Current Plan</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
