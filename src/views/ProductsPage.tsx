import React, { useState, useMemo } from "react";
import { usePagination } from "../utils/usePagination";
import { usePOSStore, Product, StockMoveType } from "../store/posStore";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, ArrowUpDown, XCircle, CalendarClock } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { cn } from "../utils/cn";

const emptyProduct = { name: "", barcode: "", price: 0, costPrice: 0, stock: 0, categoryId: "", storeId: "", lowStockThreshold: 10, expiryDate: "", image: "" };

export const ProductsPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, adjustStock, currentStoreId, stores, currentUser } = usePOSStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [stockForm, setStockForm] = useState({ qty: 1, type: "IN" as StockMoveType, note: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stockSaving, setStockSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === "super_admin";
  const canEdit = ["super_admin", "store_admin", "manager"].includes(currentUser?.role ?? "");

  const storeId = currentStoreId ?? "";
  const storeCategories = categories.filter(c => isSuperAdmin || c.storeId === storeId);

  const storeProducts = useMemo(() => {
    let prods = isSuperAdmin ? products : products.filter(p => p.storeId === storeId);
    if (search) prods = prods.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search));
    if (filterStatus === "low") prods = prods.filter(p => p.stock <= p.lowStockThreshold && p.stock > 0);
    if (filterStatus === "out") prods = prods.filter(p => p.stock === 0);
    if (filterStatus === "expiring") prods = prods.filter(p => p.expiryDate);
    return prods;
  }, [products, search, storeId, isSuperAdmin, filterStatus]);

  const { currentItems: pagedProducts, page: prodPage, setPage: setProdPage, totalPages: prodTotalPages, hasNext: prodHasNext, hasPrev: prodHasPrev } = usePagination(storeProducts, 20);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) { const data = await res.json(); setForm(f => ({ ...f, image: data.url })); }
    } catch (err) { console.error("Product image upload failed:", err); }
    finally { setUploading(false); }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyProduct, storeId, categoryId: storeCategories[0]?.id ?? "" });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, barcode: p.barcode, price: p.price, costPrice: p.costPrice, stock: p.stock, categoryId: p.categoryId, storeId: p.storeId, lowStockThreshold: p.lowStockThreshold, expiryDate: p.expiryDate ?? "", image: p.image ?? "" });
    setError(null);
    setShowModal(true);
  };

  const openStock = (p: Product) => {
    setStockProduct(p);
    setStockForm({ qty: 1, type: "IN", note: "" });
    setShowStockModal(true);
  };

  const handleSave = async () => {
    if (!form.name || form.price <= 0) return;
    setSaving(true);
    setError(null);
    try {
      if (editProduct) {
        // UPDATE
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-user-id": currentUser!.id },
          body: JSON.stringify({ id: editProduct.id, ...form }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to update product");
        const updated = await res.json();
        updateProduct(updated.id, updated);
      } else {
        // CREATE
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": currentUser!.id },
          body: JSON.stringify({ ...form, storeId: form.storeId || storeId }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to create product");
        const created = await res.json();
        addProduct(created);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleStockAdjust = async () => {
    if (!stockProduct || stockForm.qty <= 0) return;
    setStockSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": currentUser!.id },
        body: JSON.stringify({ action: "adjustStock", productId: stockProduct.id, qty: stockForm.qty, type: stockForm.type, note: stockForm.note }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to adjust stock");
      const { product: updatedProduct, log } = await res.json();
      // Sync updated stock and new inventory log back into Zustand
      updateProduct(updatedProduct.id, updatedProduct);
      adjustStock(stockProduct.id, stockForm.qty, stockForm.type, stockForm.note); // local log entry (id safe)
      setShowStockModal(false);
    } catch (err: any) {
      console.error("Stock adjust error:", err);
    } finally {
      setStockSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products?id=${p.id}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUser!.id },
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to delete product");
      deleteProduct(p.id);
    } catch (err: any) {
      console.error("Delete product error:", err);
      alert(err.message ?? "Failed to delete product.");
    }
  };

  const storeName = (id: string) => stores.find(s => s.id === id)?.name ?? id;
  const categoryName = (id: string) => categories.find(c => c.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "low", "out", "expiring"].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={cn("px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition duration-150",
                filterStatus === f
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "glass border border-white/60 text-slate-600 hover:bg-white/40 hover:text-slate-800")}
            >
              {f === "all" ? "All Products" : f === "low" ? (
                <span className="flex items-center gap-1.5"><AlertTriangle size={12} />Low Stock</span>
              ) : f === "out" ? (
                <span className="flex items-center gap-1.5"><XCircle size={12} />Out of Stock</span>
              ) : (
                <span className="flex items-center gap-1.5"><CalendarClock size={12} />Expiring</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm w-56 glass-input border border-white/60 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          {canEdit && <Button onClick={openAdd} icon={<Plus size={16} />}>Add Product</Button>}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Products", value: storeProducts.length, color: "text-indigo-600" },
          { label: "In Stock", value: storeProducts.filter(p => p.stock > 0).length, color: "text-emerald-600" },
          { label: "Low Stock", value: storeProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length, color: "text-amber-600" },
          { label: "Out of Stock", value: storeProducts.filter(p => p.stock === 0).length, color: "text-red-600" },
        ].map(stat => (
          <div key={stat.label} className="glass-card rounded-2xl border border-white/60 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest">{stat.label}</p>
            <p className={cn("text-2xl font-extrabold mt-0.5", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/50 bg-slate-50/30 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Barcode</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price / Cost</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                {isSuperAdmin && <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>}
                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                {canEdit && <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {pagedProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl border border-slate-200/50 object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-400 font-bold flex-shrink-0 text-xs">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        {p.expiryDate && <p className="text-[10px] font-medium text-orange-500">Expires: {p.expiryDate}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 font-mono text-xs">{p.barcode}</td>
                  <td className="px-4 py-3"><Badge variant="neutral">{categoryName(p.categoryId)}</Badge></td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">GH₵ {p.price.toFixed(2)}</p>
                    <p className="text-xs text-slate-400 font-medium">Cost: GH₵ {p.costPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold", p.stock === 0 ? "text-rose-600" : p.stock <= p.lowStockThreshold ? "text-amber-600" : "text-slate-700")}>{p.stock}</span>
                      {p.stock <= p.lowStockThreshold && p.stock > 0 && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                  </td>
                  {isSuperAdmin && <td className="px-4 py-3 text-xs text-slate-500 font-medium">{storeName(p.storeId)}</td>}
                  <td className="px-4 py-3">
                    <Badge variant={p.stock === 0 ? "danger" : p.stock <= p.lowStockThreshold ? "warning" : "success"}>
                      {p.stock === 0 ? "Out of Stock" : p.stock <= p.lowStockThreshold ? "Low Stock" : "In Stock"}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openStock(p)} className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition" title="Adjust Stock"><ArrowUpDown size={14} /></button>
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-500/10 rounded-lg transition" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!storeProducts.length && (
            <div className="py-16 text-center text-slate-400">
              <Package size={40} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">No products found</p>
            </div>
          )}
          {prodTotalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100/50">
              <p className="text-xs text-slate-500 font-medium">
                Showing {((prodPage - 1) * 20) + 1}–{Math.min(prodPage * 20, storeProducts.length)} of {storeProducts.length} products
              </p>
              <div className="flex gap-1">
                <button onClick={() => setProdPage(p => Math.max(1, p - 1))} disabled={!prodHasPrev} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Prev</button>
                <span className="px-3 py-1.5 text-xs font-semibold text-slate-500">{prodPage} / {prodTotalPages}</span>
                <button onClick={() => setProdPage(p => Math.min(prodTotalPages, p + 1))} disabled={!prodHasNext} className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/60 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">Next</button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editProduct ? "Edit Product" : "Add New Product"} size="md"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save Product"}</Button></>}
      >
        <div className="space-y-4">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">{error}</div>}
          <Input label="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Coca-Cola 500ml" />
          <Input label="Barcode" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Scan or type barcode" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Selling Price (GH₵) *" type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
            <Input label="Cost Price (GH₵)" type="number" value={form.costPrice || ""} onChange={e => setForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Current Stock" type="number" value={form.stock || ""} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} />
            <Input label="Low Stock Alert At" type="number" value={form.lowStockThreshold || ""} onChange={e => setForm(f => ({ ...f, lowStockThreshold: parseInt(e.target.value) || 10 }))} />
          </div>
          <Select label="Category" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            options={[{ value: "", label: "Select Category" }, ...storeCategories.map(c => ({ value: c.id, label: c.name }))]} />
          {isSuperAdmin && (
            <Select label="Store" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))}
              options={stores.map(s => ({ value: s.id, label: s.name }))} />
          )}
          <Input label="Expiry Date (optional)" type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
          <div>
            <label className="text-xs font-semibold text-slate-500/80 uppercase tracking-widest block mb-1.5">Product Image</label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={form.image} alt="Product Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setForm(f => ({ ...f, image: "" }))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition text-[9px] font-bold">Remove</button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200/50 flex items-center justify-center text-slate-400 text-xs flex-shrink-0 font-medium">None</div>
              )}
              <input type="file" accept="image/*" onChange={handleProductImageUpload} disabled={uploading}
                className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-700 hover:file:bg-indigo-500/20 file:cursor-pointer" />
              {uploading && <span className="text-[10px] text-slate-400 font-medium">Uploading...</span>}
            </div>
          </div>
        </div>
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal open={showStockModal} onClose={() => setShowStockModal(false)} title={`Adjust Stock — ${stockProduct?.name}`} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowStockModal(false)}>Cancel</Button><Button onClick={handleStockAdjust} disabled={stockSaving}>{stockSaving ? "Saving…" : "Confirm"}</Button></>}
      >
        <div className="space-y-4">
          <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-3 text-sm">
            <p className="text-slate-500 font-medium">Current Stock: <span className="font-bold text-slate-800">{stockProduct?.stock} units</span></p>
          </div>
          <Select label="Adjustment Type" value={stockForm.type} onChange={e => setStockForm(f => ({ ...f, type: e.target.value as StockMoveType }))}
            options={[{ value: "IN", label: "Stock In (Add)" }, { value: "OUT", label: "Stock Out (Remove)" }, { value: "TRANSFER", label: "Transfer In" }]} />
          <Input label="Quantity" type="number" min="1" value={stockForm.qty || ""} onChange={e => setStockForm(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))} />
          <Input label="Note (optional)" value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} placeholder="Reason for adjustment" />
        </div>
      </Modal>
    </div>
  );
};
