import React, { useState } from "react";
import { usePOSStore, Supplier } from "../store/posStore";
import { Plus, Edit2, Truck, Phone, Mail, CheckCircle, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { format } from "date-fns";

export const SuppliersPage: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, purchaseOrders, addPurchaseOrder, receivePurchaseOrder, products, currentStoreId, currentUser, stores } = usePOSStore();
  const [showSupModal, setShowSupModal] = useState(false);
  const [showPOModal, setShowPOModal] = useState(false);
  const [editSup, setEditSup] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", balance: 0, storeId: "" });
  const [poForm, setPOForm] = useState({ supplierId: "", items: [{ productId: "", qty: 1, cost: 0 }] });
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("suppliers");

  const isSuperAdmin = currentUser?.role === "super_admin";
  const storeSuppliers = isSuperAdmin ? suppliers : suppliers.filter(s => s.storeId === currentStoreId);
  const storeOrders = isSuperAdmin ? purchaseOrders : purchaseOrders.filter(o => o.storeId === currentStoreId);
  const storeProducts = products.filter(p => p.storeId === currentStoreId);

  const openAdd = () => { setEditSup(null); setForm({ name: "", phone: "", email: "", address: "", balance: 0, storeId: currentStoreId ?? "" }); setShowSupModal(true); };
  const openEdit = (s: Supplier) => { setEditSup(s); setForm({ name: s.name, phone: s.phone, email: s.email ?? "", address: s.address ?? "", balance: s.balance, storeId: s.storeId }); setShowSupModal(true); };

  const handleSaveSup = () => {
    if (!form.name || !form.phone) return;
    if (editSup) updateSupplier(editSup.id, form);
    else addSupplier({ ...form, storeId: form.storeId || (currentStoreId ?? "") });
    setShowSupModal(false);
  };

  const handleSavePO = () => {
    if (!poForm.supplierId || !poForm.items[0].productId) return;
    const sup = suppliers.find(s => s.id === poForm.supplierId);
    const items = poForm.items.filter(i => i.productId).map(i => {
      const prod = products.find(p => p.id === i.productId);
      return { productId: i.productId, productName: prod?.name ?? "", qty: i.qty, cost: i.cost || (prod?.costPrice ?? 0) };
    });
    const total = items.reduce((sum, i) => sum + i.qty * i.cost, 0);
    addPurchaseOrder({ supplierId: poForm.supplierId, supplierName: sup?.name ?? "", items, total, storeId: currentStoreId ?? "", status: "pending" });
    setShowPOModal(false);
    setPOForm({ supplierId: "", items: [{ productId: "", qty: 1, cost: 0 }] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/40 border border-slate-200/50 rounded-xl p-1">
          <button onClick={() => setActiveTab("suppliers")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "suppliers" ? "bg-white/80 shadow text-slate-800 border border-white/50" : "text-slate-500 hover:text-slate-800"}`}>Suppliers</button>
          <button onClick={() => setActiveTab("orders")} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${activeTab === "orders" ? "bg-white/80 shadow text-slate-800 border border-white/50" : "text-slate-500 hover:text-slate-800"}`}>
            Purchase Orders {storeOrders.filter(o => o.status === "pending").length > 0 && <span className="ml-1 text-xs bg-amber-500 text-white rounded-full px-1.5 py-0.5">{storeOrders.filter(o => o.status === "pending").length}</span>}
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === "suppliers" && <Button onClick={openAdd} icon={<Plus size={16} />}>Add Supplier</Button>}
          {activeTab === "orders" && <Button onClick={() => setShowPOModal(true)} icon={<Plus size={16} />}>New Order</Button>}
        </div>
      </div>

      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeSuppliers.map(sup => (
            <div key={sup.id} className="glass-card rounded-2xl border border-white/60 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {sup.name[0]}
                </div>
                <button onClick={() => openEdit(sup)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white/50 rounded-lg transition"><Edit2 size={14} /></button>
              </div>
              <h3 className="font-semibold text-slate-800">{sup.name}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-500"><Phone size={11} />{sup.phone}</div>
                {sup.email && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Mail size={11} />{sup.email}</div>}
                {sup.address && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Truck size={11} />{sup.address}</div>}
              </div>
              {sup.balance > 0 && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs text-red-600 font-medium">Outstanding: GH₵ {sup.balance.toFixed(2)}</p>
                </div>
              )}
              <div className="mt-3 text-xs text-gray-400">
                {storeOrders.filter(o => o.supplierId === sup.id).length} order(s)
              </div>
            </div>
          ))}
          {!storeSuppliers.length && <div className="col-span-3 py-16 text-center text-gray-400"><Truck size={40} className="mx-auto mb-2 opacity-40" /><p>No suppliers yet</p></div>}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="glass-card rounded-2xl border border-white/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/40 bg-indigo-500/5">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Items</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {storeOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                <tr key={order.id} className="hover:bg-white/30 border-b border-slate-100/50 last:border-0 transition">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{order.id.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{order.supplierName}</td>
                  <td className="px-4 py-3 text-slate-600">{order.items.length} item(s)</td>
                  <td className="px-4 py-3 font-semibold text-slate-800">GH₵ {order.total.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{format(new Date(order.createdAt), "dd MMM yyyy")}</td>
                  <td className="px-4 py-3"><Badge variant={order.status === "received" ? "success" : order.status === "cancelled" ? "danger" : "warning"}>{order.status}</Badge></td>
                  <td className="px-4 py-3">
                    {order.status === "pending" && (
                      <button onClick={() => receivePurchaseOrder(order.id)} className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded-lg transition">
                        <CheckCircle size={12} /> Receive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!storeOrders.length && <tr><td colSpan={7} className="py-12 text-center text-gray-400 text-sm">No purchase orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier Modal */}
      <Modal open={showSupModal} onClose={() => setShowSupModal(false)} title={editSup ? "Edit Supplier" : "Add Supplier"} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowSupModal(false)}>Cancel</Button><Button onClick={handleSaveSup}>Save</Button></>}>
        <div className="space-y-3">
          <Input label="Supplier Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Phone *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          {isSuperAdmin && <Select label="Store" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} options={stores.map(s => ({ value: s.id, label: s.name }))} />}
        </div>
      </Modal>

      {/* PO Modal */}
      <Modal open={showPOModal} onClose={() => setShowPOModal(false)} title="New Purchase Order" size="md"
        footer={<><Button variant="secondary" onClick={() => setShowPOModal(false)}>Cancel</Button><Button onClick={handleSavePO}>Create Order</Button></>}>
        <div className="space-y-4">
          <Select
            label="Supplier"
            value={poForm.supplierId}
            onChange={e => setPOForm(f => ({ ...f, supplierId: e.target.value }))}
            options={[{ value: "", label: "Select Supplier" }, ...storeSuppliers.map(s => ({ value: s.id, label: s.name }))]}
          />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Order Items</p>
            {poForm.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={item.productId}
                  onChange={e => setPOForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, productId: e.target.value } : it) }))}
                  className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="">Select Product</option>
                  {storeProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="number" value={item.qty} min="1" placeholder="Qty" onChange={e => setPOForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, qty: parseInt(e.target.value) || 1 } : it) }))} className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                <input type="number" value={item.cost || ""} placeholder="Cost" onChange={e => setPOForm(f => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, cost: parseFloat(e.target.value) || 0 } : it) }))} className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                {idx > 0 && <button onClick={() => setPOForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600"><X size={16} /></button>}
              </div>
            ))}
            <button onClick={() => setPOForm(f => ({ ...f, items: [...f.items, { productId: "", qty: 1, cost: 0 }] }))} className="text-sm text-indigo-600 hover:underline mt-1">+ Add Item</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
