import React, { useState, useMemo } from "react";
import { usePOSStore, Customer } from "../store/posStore";
import { Plus, Search, Edit2, Users, Phone, Mail, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { format } from "date-fns";

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer, updateCustomer, sales, currentStoreId, currentUser } = usePOSStore();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", creditBalance: 0 });

  const isSuperAdmin = currentUser?.role === "super_admin";
  const storeCustomers = useMemo(() => {
    let list = isSuperAdmin ? customers : customers.filter(c => c.storeId === currentStoreId);
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
    return list;
  }, [customers, currentStoreId, isSuperAdmin, search]);

  const openAdd = () => {
    setEditCustomer(null);
    setForm({ name: "", phone: "", email: "", creditBalance: 0 });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({ name: c.name, phone: c.phone, email: c.email ?? "", creditBalance: c.creditBalance });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.phone) return;
    if (editCustomer) {
      updateCustomer(editCustomer.id, form);
    } else {
      addCustomer({ ...form, storeId: currentStoreId ?? "", creditBalance: 0 });
    }
    setShowModal(false);
  };

  const getCustomerSales = (customerId: string) =>
    sales.filter(s => s.customerId === customerId).length;

  const getCustomerTotal = (customerId: string) =>
    sales.filter(s => s.customerId === customerId).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64" />
        </div>
        <Button onClick={openAdd} icon={<Plus size={16} />}>Add Customer</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Customers", value: storeCustomers.length, color: "text-indigo-600" },
          { label: "With Credit", value: storeCustomers.filter(c => c.creditBalance > 0).length, color: "text-amber-600" },
          { label: "Total Credit Owed", value: `GHS ${storeCustomers.reduce((s, c) => s + c.creditBalance, 0).toFixed(2)}`, color: "text-red-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {storeCustomers.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {c.name[0].toUpperCase()}
              </div>
              <button onClick={() => openEdit(c)} className="p-1.5 text-gray-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"><Edit2 size={14} /></button>
            </div>
            <h3 className="font-semibold text-gray-800">{c.name}</h3>
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500"><Phone size={11} />{c.phone}</div>
              {c.email && <div className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={11} />{c.email}</div>}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-gray-800">{getCustomerSales(c.id)}</p>
                <p className="text-[10px] text-gray-400">Total Sales</p>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">GHS {getCustomerTotal(c.id).toFixed(0)}</p>
                <p className="text-[10px] text-gray-400">Total Spent</p>
              </div>
            </div>
            {c.creditBalance > 0 && (
              <div className="mt-2 flex items-center gap-1.5 p-2 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle size={12} className="text-amber-500" />
                <span className="text-xs text-amber-700">Credit: GHS {c.creditBalance.toFixed(2)}</span>
              </div>
            )}
            <p className="text-[10px] text-gray-400 mt-2">Member since {format(new Date(c.createdAt), "MMM yyyy")}</p>
          </div>
        ))}
        {!storeCustomers.length && (
          <div className="col-span-3 py-16 text-center text-gray-400">
            <Users size={40} className="mx-auto mb-2 opacity-40" />
            <p>No customers found</p>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editCustomer ? "Edit Customer" : "Add New Customer"}
        size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave}>Save</Button></>}
      >
        <div className="space-y-3">
          <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Customer name" />
          <Input label="Phone Number *" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 0244-123456" />
          <Input label="Email (optional)" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="customer@email.com" />
          {editCustomer && <Input label="Credit Balance (GHS)" type="number" value={form.creditBalance || ""} onChange={e => setForm(f => ({ ...f, creditBalance: parseFloat(e.target.value) || 0 }))} />}
        </div>
      </Modal>
    </div>
  );
};
