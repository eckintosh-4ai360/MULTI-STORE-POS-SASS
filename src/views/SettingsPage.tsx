import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import { Store, Bell, Shield, Palette, Database, CheckCircle } from "lucide-react";
import { Input, Select } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

export const SettingsPage: React.FC = () => {
  const { stores, updateStore, currentStoreId } = usePOSStore();
  const store = stores.find(s => s.id === currentStoreId);
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
  ];

  const [activeSection, setActiveSection] = useState("store");

  return (
    <div className="flex gap-6">
      {/* Settings Sidebar */}
      <div className="w-48 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 space-y-0.5">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition ${activeSection === id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
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
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Store Settings</h2>
              <p className="text-sm text-gray-500 mt-0.5">Configure your store's basic information</p>
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
              {saved && <span className="text-sm text-emerald-600">Settings updated successfully</span>}
            </div>
          </div>
        )}

        {activeSection === "receipt" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Receipt Configuration</h2>
              <p className="text-sm text-gray-500 mt-0.5">Customize your receipt template</p>
            </div>
            <div className="space-y-4">
              <Input label="Receipt Header" value={form.receiptHeader} onChange={e => setForm(f => ({ ...f, receiptHeader: e.target.value }))} placeholder="Thank you for shopping with us!" />
              <Input label="Receipt Footer" value={form.receiptFooter} onChange={e => setForm(f => ({ ...f, receiptFooter: e.target.value }))} placeholder="Visit us again!" />
            </div>
            {/* Receipt Preview */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 font-mono text-xs max-w-xs">
                <p className="text-center font-bold">{form.name || "Store Name"}</p>
                <p className="text-center text-gray-400 text-[10px]">{form.location || "Location"}</p>
                <p className="text-center text-gray-400 text-[10px]">{form.receiptHeader || "Header text"}</p>
                <div className="border-t border-dashed my-2" />
                <p className="text-center text-gray-400">[Sale Items Here]</p>
                <div className="border-t border-dashed my-2" />
                <p className="text-center font-bold">TOTAL: {form.currency} 0.00</p>
                <div className="border-t border-dashed my-2" />
                <p className="text-center text-gray-400 text-[10px]">{form.receiptFooter || "Footer text"}</p>
              </div>
            </div>
            <Button onClick={handleSave}>Save Receipt Settings</Button>
          </div>
        )}

        {activeSection === "security" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Security Settings</h2>
              <p className="text-sm text-gray-500">Manage authentication and access control</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Role-based Access Control", desc: "Users can only access features for their role", enabled: true },
                { label: "Session Timeout", desc: "Auto-logout after 8 hours of inactivity", enabled: true },
                { label: "Activity Logging", desc: "Log all user actions for audit trail", enabled: true },
                { label: "Two-Factor Authentication", desc: "Require 2FA for admin accounts", enabled: false },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition ${item.enabled ? "bg-indigo-500" : "bg-gray-300"} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Configure when to receive alerts</p>
            </div>
            <div className="space-y-3">
              {[
                { label: "Low Stock Alerts", desc: "Notify when product stock falls below threshold", enabled: true },
                { label: "New Sale Notifications", desc: "Alert when a sale is completed", enabled: false },
                { label: "Daily Sales Summary", desc: "Receive daily report at end of business", enabled: true },
                { label: "Expiry Date Alerts", desc: "Warn when products are about to expire", enabled: true },
                { label: "Purchase Order Updates", desc: "Notify on order status changes", enabled: true },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <div className={`w-10 h-5 rounded-full transition ${item.enabled ? "bg-indigo-500" : "bg-gray-300"} relative`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${item.enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === "data" && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Data & Backup</h2>
              <p className="text-sm text-gray-500">Manage your data exports and backups</p>
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
                <button key={item.label} className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl transition text-left">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-700"><strong>Note:</strong> In this demo, export functions simulate file downloads. In production, these connect to your API endpoints.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
