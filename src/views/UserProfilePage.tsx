import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import {
  User, Mail, Shield, Store as StoreIcon, Calendar,
  Clock, Edit3, LogOut, Key, Check, X, Camera,
  Activity, ShoppingCart, TrendingUp, Package
} from "lucide-react";
import { format } from "date-fns";

const roleLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
  super_admin: { label: "Super Admin", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  store_admin: { label: "Store Admin", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  manager: { label: "Manager", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  cashier: { label: "Cashier", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export const UserProfilePage: React.FC = () => {
  const { currentUser, logout, sales, stores, currentStoreId } = usePOSStore();
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(currentUser?.name ?? "");
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const role = roleLabels[currentUser.role] ?? {
    label: currentUser.role,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
  };

  const currentStore = stores.find(s => s.id === (currentUser.storeId ?? currentStoreId));

  // Stats for this user
  const userSales = sales.filter(s => s.userId === currentUser.id && s.status === "completed");
  const totalRevenue = userSales.reduce((sum, s) => sum + s.total, 0);
  const avgSale = userSales.length ? totalRevenue / userSales.length : 0;

  const handleSaveName = () => {
    // In a real app, you'd call updateUser here
    setSaved(true);
    setEditingName(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const avatarInitials = (currentUser.name ?? "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarGradients: Record<string, string> = {
    super_admin: "from-purple-500 to-indigo-600",
    store_admin: "from-indigo-500 to-blue-600",
    manager: "from-blue-500 to-cyan-600",
    cashier: "from-emerald-400 to-teal-600",
  };
  const avatarGrad = avatarGradients[currentUser.role] ?? "from-indigo-500 to-purple-600";

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">

      {/* Profile Hero Card */}
      <div className="glass-card rounded-3xl border border-white/70 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className={`h-28 bg-gradient-to-r ${avatarGrad} opacity-80 relative`}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}
          />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${avatarGrad} flex items-center justify-center text-3xl font-black text-white shadow-xl border-4 border-white`}>
                {avatarInitials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center shadow-md transition">
                <Camera size={13} className="text-white" />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 glass-card border border-red-100 hover:border-red-300 text-red-500 hover:text-red-600 rounded-xl text-sm font-semibold transition"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Name & role */}
          <div className="flex items-start justify-between">
            <div>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    className="glass-input px-3 py-1.5 rounded-xl text-xl font-bold text-slate-800 focus:outline-none w-64"
                    autoFocus
                    onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") setEditingName(false); }}
                  />
                  <button onClick={handleSaveName} className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition">
                    <Check size={15} />
                  </button>
                  <button onClick={() => setEditingName(false)} className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition">
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-slate-800">{currentUser.name}</h2>
                  <button
                    onClick={() => { setDraftName(currentUser.name); setEditingName(true); }}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                  >
                    <Edit3 size={13} />
                  </button>
                  {saved && <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1"><Check size={11} /> Saved</span>}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${role.bg} ${role.color} ${role.border}`}>
                  <Shield size={11} />
                  {role.label}
                </span>
                {currentUser.status === "active" ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 border border-red-200">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {(currentUser.role === "cashier" || currentUser.role === "manager" || currentUser.role === "store_admin") && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: ShoppingCart, label: "Total Sales", value: userSales.length.toString(), color: "text-indigo-600", bg: "bg-indigo-50" },
            { icon: TrendingUp, label: "Total Revenue", value: `GH₵${totalRevenue.toFixed(2)}`, color: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: Activity, label: "Avg. Sale", value: `GH₵${avgSale.toFixed(2)}`, color: "text-amber-600", bg: "bg-amber-50" },
          ].map(stat => (
            <div key={stat.label} className="glass-stat-card rounded-2xl border border-white/70 p-4 text-center">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon size={18} className={stat.color} />
              </div>
              <p className="text-lg font-black text-slate-800">{stat.value}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Account Details */}
      <div className="glass-card rounded-3xl border border-white/70 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Account Information</h3>

        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail size={15} className="text-indigo-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Email Address</p>
              <p className="text-sm font-semibold text-slate-700 truncate">{currentUser.email}</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={15} className="text-slate-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">User ID</p>
              <p className="text-xs font-mono text-slate-500 truncate">{currentUser.id}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className={`w-9 h-9 ${role.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Shield size={15} className={role.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Role &amp; Permissions</p>
              <p className="text-sm font-semibold text-slate-700">{role.label}</p>
            </div>
          </div>

          {/* Store assignment */}
          {currentStore && (
            <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <StoreIcon size={15} className="text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Assigned Store</p>
                <p className="text-sm font-semibold text-slate-700">{currentStore.name}</p>
                <p className="text-xs text-slate-400">{currentStore.location}</p>
              </div>
            </div>
          )}

          {currentUser.role === "super_admin" && (
            <div className="flex items-center gap-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package size={15} className="text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-0.5">Access Level</p>
                <p className="text-sm font-semibold text-purple-700">All Stores — Full Access</p>
              </div>
            </div>
          )}

          {/* Member since */}
          <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
            <div className="w-9 h-9 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={15} className="text-sky-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Member Since</p>
              <p className="text-sm font-semibold text-slate-700">
                {format(new Date(currentUser.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Last login */}
          {currentUser.lastLogin && (
            <div className="flex items-center gap-3 p-3 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={15} className="text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Last Login</p>
                <p className="text-sm font-semibold text-slate-700">
                  {format(new Date(currentUser.lastLogin), "MMMM d, yyyy · h:mm a")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Card */}
      <div className="glass-card rounded-3xl border border-white/70 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Security</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Key size={15} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Password</p>
              <p className="text-xs text-slate-400">Last changed: unknown</p>
            </div>
          </div>
          <button className="px-4 py-2 glass-card border border-white/70 hover:border-indigo-200 text-slate-600 hover:text-indigo-600 rounded-xl text-xs font-bold transition">
            Change Password
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass-card rounded-3xl border border-red-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-4">Session</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Sign out of your account</p>
            <p className="text-xs text-slate-400 mt-0.5">You will be redirected to the login page.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-sm font-bold transition"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
