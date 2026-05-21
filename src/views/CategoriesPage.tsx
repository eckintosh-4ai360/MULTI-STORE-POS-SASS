import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import { Plus, Tag } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";

export const CategoriesPage: React.FC = () => {
  const { categories, addCategory, products, stores, currentStoreId, currentUser } = usePOSStore();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", storeId: "" });

  const isSuperAdmin = currentUser?.role === "super_admin";
  const visibleCats = isSuperAdmin ? categories : categories.filter(c => c.storeId === currentStoreId);

  const handleSave = () => {
    if (!form.name) return;
    addCategory({ name: form.name, storeId: form.storeId || (currentStoreId ?? "") });
    setShowModal(false);
    setForm({ name: "", storeId: "" });
  };

  const storeName = (id: string) => stores.find(s => s.id === id)?.name ?? id;
  const productCount = (catId: string) => products.filter(p => p.categoryId === catId).length;

  const catColors = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-purple-500", "bg-cyan-500", "bg-blue-500", "bg-orange-500"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{visibleCats.length} categories</p>
        <Button onClick={() => { setForm({ name: "", storeId: currentStoreId ?? "" }); setShowModal(true); }} icon={<Plus size={16} />}>Add Category</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleCats.map((cat, i) => {
          const count = productCount(cat.id);
          return (
            <div key={cat.id} className="glass-card rounded-2xl border border-white/60 shadow-sm overflow-hidden hover:shadow-md transition">
              <div className={`h-2 ${catColors[i % catColors.length]}`} />
              <div className="p-5">
                <div className={`w-10 h-10 rounded-xl ${catColors[i % catColors.length]} flex items-center justify-center mb-3`}>
                  <Tag size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">{cat.name}</h3>
                {isSuperAdmin && <p className="text-xs text-gray-400 mt-0.5">{storeName(cat.storeId)}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">{count}</span>
                  <span className="text-xs text-gray-500">product{count !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          );
        })}
        {!visibleCats.length && (
          <div className="col-span-4 py-16 text-center text-gray-400">
            <Tag size={40} className="mx-auto mb-2 opacity-40" />
            <p>No categories yet</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Category" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>Add</Button></>}>
        <div className="space-y-3">
          <Input label="Category Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Beverages" />
          {isSuperAdmin && (
            <Select label="Store" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))} options={stores.map(s => ({ value: s.id, label: s.name }))} />
          )}
        </div>
      </Modal>
    </div>
  );
};
