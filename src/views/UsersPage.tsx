import React, { useState } from "react";
import { usePOSStore, User, Role } from "../store/posStore";
import { Plus, Edit2, UserCheck, UserX, Shield } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { format } from "date-fns";

const roleColors: Record<Role, "purple" | "info" | "warning" | "success"> = {
  super_admin: "purple",
  store_admin: "info",
  manager: "warning",
  cashier: "success",
};

const roleIcons: Record<Role, string> = {
  super_admin: "👑",
  store_admin: "🏪",
  manager: "📊",
  cashier: "💳",
};

export const UsersPage: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, stores, currentUser, organization } = usePOSStore();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "cashier" as Role, storeId: "" });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = ["super_admin", "store_admin"].includes(currentUser?.role ?? "");

  const visibleUsers = isSuperAdmin ? users : users.filter(u => u.storeId === currentUser?.storeId);

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", role: "cashier", storeId: stores[0]?.id ?? "" });
    setError(null);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, storeId: u.storeId ?? "" });
    setError(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    setError(null);
    try {
      if (editUser) {
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-user-id": currentUser!.id },
          body: JSON.stringify({ id: editUser.id, ...form, storeId: form.role === "super_admin" ? null : form.storeId }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to update user");
        const updated = await res.json();
        updateUser(updated.id, updated);
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": currentUser!.id },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            role: form.role,
            storeId: form.role === "super_admin" ? null : form.storeId,
            status: "active",
            organizationId: organization?.id ?? null,
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to create user");
        const created = await res.json();
        addUser(created);
      }
      setShowModal(false);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (u: User) => {
    if (u.id === currentUser?.id) return;
    setTogglingId(u.id);
    try {
      const newStatus = u.status === "active" ? "inactive" : "active";
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-user-id": currentUser!.id },
        body: JSON.stringify({ id: u.id, status: newStatus }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Failed to update user status");
      const updated = await res.json();
      updateUser(updated.id, updated);
    } catch (err: any) {
      console.error("Toggle user status error:", err);
      // fallback: revert optimistic update
      toggleUserStatus(u.id);
      setTimeout(() => toggleUserStatus(u.id), 0);
    } finally {
      setTogglingId(null);
    }
  };

  const storeName = (id: string | null) => {
    if (!id) return "All Stores";
    return stores.find(s => s.id === id)?.name ?? id;
  };

  const byRole = (role: Role) => visibleUsers.filter(u => u.role === role);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {(["super_admin", "store_admin", "manager", "cashier"] as Role[]).map(r => (
            <div key={r} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>{roleIcons[r]}</span>
              <span className="capitalize">{r.replace("_", " ")}: <strong>{byRole(r).length}</strong></span>
            </div>
          ))}
        </div>
        {isAdmin && <Button onClick={openAdd} icon={<Plus size={16} />}>Add User</Button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["super_admin", "store_admin", "manager", "cashier"] as Role[]).map(r => (
          <div key={r} className="glass-stat-card rounded-2xl p-4">
            <p className="text-xs text-slate-500 capitalize">{r.replace("_", " ")}</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{byRole(r).length}</p>
            <p className="text-xs text-slate-400">{byRole(r).filter(u => u.status === "active").length} active</p>
          </div>
        ))}
      </div>

      {/* User Table */}
      <div className="glass-card rounded-2xl border border-white/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200/40 bg-indigo-500/5">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Role</th>
              {isSuperAdmin && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Store</th>}
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Joined</th>
              {isAdmin && <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {visibleUsers.map(u => (
              <tr key={u.id} className="hover:bg-white/30 border-b border-slate-100/50 last:border-0 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={roleColors[u.role]}>{roleIcons[u.role]} {u.role.replace("_", " ")}</Badge>
                </td>
                {isSuperAdmin && <td className="px-4 py-3 text-xs text-slate-500">{storeName(u.storeId)}</td>}
                <td className="px-4 py-3">
                  <Badge variant={u.status === "active" ? "success" : "neutral"}>{u.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{format(new Date(u.createdAt), "dd MMM yyyy")}</td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 text-indigo-600 hover:bg-white/50 rounded-lg transition"><Edit2 size={14} /></button>
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={togglingId === u.id}
                          className={`p-1.5 rounded-lg transition disabled:opacity-40 ${u.status === "active" ? "text-amber-700 hover:bg-amber-500/10" : "text-emerald-700 hover:bg-emerald-500/10"}`}
                        >
                          {togglingId === u.id ? <span className="text-[10px] animate-pulse">…</span> : u.status === "active" ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? "Edit User" : "Add New User"} size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save User"}</Button></>}
      >
        <div className="space-y-3">
          {error && <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">{error}</div>}
          <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="user@company.com" />
          <Select label="Role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
            options={[
              { value: "cashier", label: "💳 Cashier" },
              { value: "manager", label: "📊 Manager" },
              { value: "store_admin", label: "🏪 Store Admin" },
              ...(isSuperAdmin ? [{ value: "super_admin", label: "👑 Super Admin" }] : []),
            ]}
          />
          {form.role !== "super_admin" && (
            <Select label="Assign to Store" value={form.storeId} onChange={e => setForm(f => ({ ...f, storeId: e.target.value }))}
              options={stores.map(s => ({ value: s.id, label: s.name }))} />
          )}
          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <p className="text-xs text-indigo-700"><Shield size={12} className="inline mr-1" />Default password is "password123". Users should change it upon first login.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
