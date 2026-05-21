import React, { useState, useMemo } from "react";
import { usePOSStore, Product, StockMoveType } from "../store/posStore";
import { Plus, Search, Edit2, Trash2, AlertTriangle, Package, ArrowUpDown } from "lucide-react";
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

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setForm(f => ({ ...f, image: data.url }));
      }
    } catch (err) {
      console.error("Product image upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ ...emptyProduct, storeId: storeId, categoryId: storeCategories[0]?.id ?? "" });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, barcode: p.barcode, price: p.price, costPrice: p.costPrice, stock: p.stock, categoryId: p.categoryId, storeId: p.storeId, lowStockThreshold: p.lowStockThreshold, expiryDate: p.expiryDate ?? "", image: p.image ?? "" });
    setShowModal(true);
  };

  const openStock = (p: Product) => {
    setStockProduct(p);
    setStockForm({ qty: 1, type: "IN", note: "" });
    setShowStockModal(true);
  };

  const handleSave = () => {
    if (!form.name || form.price <= 0) return;
    if (editProduct) {
      updateProduct(editProduct.id, form);
    } else {
      addProduct({ ...form, storeId: form.storeId || storeId });
    }
    setShowModal(false);
  };

  const handleStockAdjust = () => {
    if (!stockProduct || stockForm.qty <= 0) return;
    adjustStock(stockProduct.id, stockForm.qty, stockForm.type, stockForm.note);
    setShowStockModal(false);
  };

  const storeName = (id: string) => stores.find(s => s.id === id)?.name ?? id;
  const categoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat?.name ?? id;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {["all", "low", "out", "expiring"].map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-medium transition", filterStatus === f ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}
            >
              {f === "all" ? "All Products" : f === "low" ? "⚠ Low Stock" : f === "out" ? "❌ Out of Stock" : "📅 Expiring"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56" />
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
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Barcode</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price / Cost</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                {isSuperAdmin && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Store</th>}
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                {canEdit && <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {storeProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl border border-gray-100 object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 font-bold flex-shrink-0 text-xs">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        {p.expiryDate && <p className="text-[10px] text-orange-500">Expires: {p.expiryDate}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.barcode}</td>
                  <td className="px-4 py-3"><Badge variant="neutral">{categoryName(p.categoryId)}</Badge></td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">GHS {p.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">Cost: GHS {p.costPrice.toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-semibold", p.stock === 0 ? "text-red-600" : p.stock <= p.lowStockThreshold ? "text-amber-600" : "text-gray-700")}>{p.stock}</span>
                      {p.stock <= p.lowStockThreshold && p.stock > 0 && <AlertTriangle size={14} className="text-amber-500" />}
                    </div>
                  </td>
                  {isSuperAdmin && <td className="px-4 py-3 text-xs text-gray-400">{storeName(p.storeId)}</td>}
                  <td className="px-4 py-3">
                    <Badge variant={p.stock === 0 ? "danger" : p.stock <= p.lowStockThreshold ? "warning" : "success"}>
                      {p.stock === 0 ? "Out of Stock" : p.stock <= p.lowStockThreshold ? "Low Stock" : "In Stock"}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openStock(p)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition" title="Adjust Stock"><ArrowUpDown size={14} /></button>
                        <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!storeProducts.length && (
            <div className="py-16 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-40" />
              <p>No products found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editProduct ? "Edit Product" : "Add New Product"}
        size="md"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>Save Product</Button></>}
      >
        <div className="space-y-4">
          <Input label="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Coca-Cola 500ml" />
          <Input label="Barcode" value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="Scan or type barcode" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Selling Price (GHS) *" type="number" value={form.price || ""} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
            <Input label="Cost Price (GHS)" type="number" value={form.costPrice || ""} onChange={e => setForm(f => ({ ...f, costPrice: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Current Stock" type="number" value={form.stock || ""} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} />
            <Input label="Low Stock Alert At" type="number" value={form.lowStockThreshold || ""} onChange={e => setForm(f => ({ ...f, lowStockThreshold: parseInt(e.target.value) || 10 }))} />
          </div>
          <Select
            label="Category"
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
            options={[{ value: "", label: "Select Category" }, ...storeCategories.map(c => ({ value: c.id, label: c.name }))]}
          />
          {isSuperAdmin && (
            <Select
              label="Store"
              value={form.storeId}
              onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))}
              options={stores.map(s => ({ value: s.id, label: s.name }))}
            />
          )}
          <Input label="Expiry Date (optional)" type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Product Image</label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                  <img src={form.image} alt="Product Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setForm(f => ({ ...f, image: "" }))}
                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition text-[9px] font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                  None
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleProductImageUpload} 
                disabled={uploading}
                className="text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer"
              />
              {uploading && <span className="text-[10px] text-gray-400">Uploading...</span>}
            </div>
          </div>
        </div>
      </Modal>

      {/* Stock Adjust Modal */}
      <Modal
        open={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={`Adjust Stock — ${stockProduct?.name}`}
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowStockModal(false)}>Cancel</Button><Button onClick={handleStockAdjust}>Confirm</Button></>}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-gray-500">Current Stock: <span className="font-bold text-gray-800">{stockProduct?.stock} units</span></p>
          </div>
          <Select
            label="Adjustment Type"
            value={stockForm.type}
            onChange={e => setStockForm(f => ({ ...f, type: e.target.value as StockMoveType }))}
            options={[
              { value: "IN", label: "Stock In (Add)" },
              { value: "OUT", label: "Stock Out (Remove)" },
              { value: "TRANSFER", label: "Transfer In" },
            ]}
          />
          <Input label="Quantity" type="number" min="1" value={stockForm.qty || ""} onChange={e => setStockForm(f => ({ ...f, qty: parseInt(e.target.value) || 1 }))} />
          <Input label="Note (optional)" value={stockForm.note} onChange={e => setStockForm(f => ({ ...f, note: e.target.value }))} placeholder="Reason for adjustment" />
        </div>
      </Modal>
    </div>
  );
};
