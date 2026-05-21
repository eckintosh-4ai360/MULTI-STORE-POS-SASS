import React, { useState } from "react";
import { usePOSStore, Store } from "../store/posStore";
import { Plus, Edit2, ToggleLeft, ToggleRight, MapPin } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

const currencies = [
  { value: "GHS", label: "GHS — Ghanaian Cedi" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
  { value: "KES", label: "KES — Kenyan Shilling" },
];

type StoreForm = { name: string; location: string; currency: string; taxRate: number; status: "active" | "inactive"; receiptHeader: string; receiptFooter: string; logo?: string };
const emptyStore: StoreForm = { name: "", location: "", currency: "GHS", taxRate: 15, status: "active", receiptHeader: "", receiptFooter: "", logo: "" };

export const StoresPage: React.FC = () => {
  const { stores, addStore, updateStore, toggleStoreStatus, sales, products, users } = usePOSStore();
  const [showModal, setShowModal] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [form, setForm] = useState<StoreForm>({ ...emptyStore });
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, logo: data.url }));
      }
    } catch (err) {
      console.error("Logo upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => { setEditStore(null); setForm({ ...emptyStore }); setShowModal(true); };
  const openEdit = (s: Store) => {
    setEditStore(s);
    setForm({ name: s.name, location: s.location, currency: s.currency, taxRate: s.taxRate, status: s.status, receiptHeader: s.receiptHeader ?? "", receiptFooter: s.receiptFooter ?? "", logo: s.logo ?? "" });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editStore) { updateStore(editStore.id, form); }
    else { addStore(form); }
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{stores.length} store(s) registered</p>
        <Button onClick={openAdd} icon={<Plus size={16} />}>Add Store</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {stores.map(store => {
          const storeSales = sales.filter(s => s.storeId === store.id);
          const storeProducts = products.filter(p => p.storeId === store.id);
          const storeUsers = users.filter(u => u.storeId === store.id);
          const storeRevenue = storeSales.reduce((sum, s) => sum + s.total, 0);
          return (
            <div key={store.id} className="glass-card rounded-2xl border border-white/60 overflow-hidden hover:shadow-md transition">
              {/* Header */}
              <div className={`h-2 ${store.status === "active" ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-slate-300"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {store.logo && (
                        <img src={store.logo} alt={store.name} className="w-8 h-8 rounded-full border border-slate-200/50 object-cover flex-shrink-0" />
                      )}
                      <h3 className="font-bold text-slate-800 text-lg">{store.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <MapPin size={11} />{store.location}
                    </div>
                  </div>
                  <Badge variant={store.status === "active" ? "success" : "neutral"}>{store.status}</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="text-center p-2 bg-indigo-500/10 rounded-xl">
                    <p className="text-sm font-bold text-indigo-700">{storeProducts.length}</p>
                    <p className="text-[10px] text-slate-500">Products</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-500/10 rounded-xl">
                    <p className="text-sm font-bold text-emerald-700">{storeSales.length}</p>
                    <p className="text-[10px] text-slate-500">Sales</p>
                  </div>
                  <div className="text-center p-2 bg-purple-500/10 rounded-xl">
                    <p className="text-sm font-bold text-purple-700">{storeUsers.length}</p>
                    <p className="text-[10px] text-slate-500">Staff</p>
                  </div>
                </div>

                <div className="bg-white/40 border border-slate-200/40 rounded-xl p-3 flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-500">Total Revenue</p>
                    <p className="font-bold text-slate-800">{store.currency} {storeRevenue.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Tax Rate</p>
                    <p className="font-bold text-slate-800">{store.taxRate}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStoreStatus(store.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition flex-1 justify-center ${store.status === "active" ? "text-amber-700 bg-amber-500/10 hover:bg-amber-500/20" : "text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"}`}
                  >
                    {store.status === "active" ? <><ToggleLeft size={14} />Deactivate</> : <><ToggleRight size={14} />Activate</>}
                  </button>
                  <button onClick={() => openEdit(store)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-700 bg-indigo-500/10 hover:bg-indigo-500/20 transition flex-1 justify-center">
                    <Edit2 size={14} /> Edit Store
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editStore ? "Edit Store" : "Add New Store"}
        size="md"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>Save Store</Button></>}
      >
        <div className="space-y-4">
          <Input label="Store Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Accra Mall Branch" />
          <Input label="Location / Address" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Accra, Greater Accra" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} options={currencies} />
            <Input label="Tax Rate (%)" type="number" min="0" max="100" value={form.taxRate || ""} onChange={e => setForm(f => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Store Logo</label>
            <div className="flex items-center gap-3">
              {form.logo ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={form.logo} alt="Logo Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setForm(f => ({ ...f, logo: "" }))}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition text-[9px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/50 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                  None
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                disabled={uploading}
                className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-700 hover:file:bg-indigo-500/20 file:cursor-pointer"
              />
              {uploading && <span className="text-[10px] text-gray-400">Uploading...</span>}
            </div>
          </div>
          <Input label="Receipt Header" value={form.receiptHeader} onChange={e => setForm(f => ({ ...f, receiptHeader: e.target.value }))} placeholder="Thank you for shopping with us!" />
          <Input label="Receipt Footer" value={form.receiptFooter} onChange={e => setForm(f => ({ ...f, receiptFooter: e.target.value }))} placeholder="Visit us again!" />
          <Select
            label="Status"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value as "active" | "inactive" }))}
            options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]}
          />
        </div>
      </Modal>
    </div>
  );
};
