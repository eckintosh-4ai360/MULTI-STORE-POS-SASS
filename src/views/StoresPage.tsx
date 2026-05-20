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

type StoreForm = { name: string; location: string; currency: string; taxRate: number; status: "active" | "inactive"; receiptHeader: string; receiptFooter: string };
const emptyStore: StoreForm = { name: "", location: "", currency: "GHS", taxRate: 15, status: "active", receiptHeader: "", receiptFooter: "" };

export const StoresPage: React.FC = () => {
  const { stores, addStore, updateStore, toggleStoreStatus, sales, products, users } = usePOSStore();
  const [showModal, setShowModal] = useState(false);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [form, setForm] = useState<StoreForm>({ ...emptyStore });

  const openAdd = () => { setEditStore(null); setForm({ ...emptyStore }); setShowModal(true); };
  const openEdit = (s: Store) => {
    setEditStore(s);
    setForm({ name: s.name, location: s.location, currency: s.currency, taxRate: s.taxRate, status: s.status, receiptHeader: s.receiptHeader ?? "", receiptFooter: s.receiptFooter ?? "" });
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
            <div key={store.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
              {/* Header */}
              <div className={`h-2 ${store.status === "active" ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gray-300"}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{store.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin size={11} />{store.location}
                    </div>
                  </div>
                  <Badge variant={store.status === "active" ? "success" : "neutral"}>{store.status}</Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 my-4">
                  <div className="text-center p-2 bg-indigo-50 rounded-xl">
                    <p className="text-sm font-bold text-indigo-700">{storeProducts.length}</p>
                    <p className="text-[10px] text-gray-500">Products</p>
                  </div>
                  <div className="text-center p-2 bg-emerald-50 rounded-xl">
                    <p className="text-sm font-bold text-emerald-700">{storeSales.length}</p>
                    <p className="text-[10px] text-gray-500">Sales</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-xl">
                    <p className="text-sm font-bold text-purple-700">{storeUsers.length}</p>
                    <p className="text-[10px] text-gray-500">Staff</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="font-bold text-gray-800">{store.currency} {storeRevenue.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Tax Rate</p>
                    <p className="font-bold text-gray-800">{store.taxRate}%</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStoreStatus(store.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition flex-1 justify-center ${store.status === "active" ? "text-amber-600 bg-amber-50 hover:bg-amber-100" : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"}`}
                  >
                    {store.status === "active" ? <><ToggleLeft size={14} />Deactivate</> : <><ToggleRight size={14} />Activate</>}
                  </button>
                  <button onClick={() => openEdit(store)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition flex-1 justify-center">
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
