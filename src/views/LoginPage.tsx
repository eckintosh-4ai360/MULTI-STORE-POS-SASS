import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import { ShoppingCart, Lock, Mail, AlertCircle } from "lucide-react";

const demoAccounts = [
  { email: "admin@multipos.com", label: "Super Admin", role: "super_admin", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { email: "kwame@multipos.com", label: "Store Admin (Accra)", role: "store_admin", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { email: "ama@multipos.com", label: "Cashier (Accra)", role: "cashier", color: "bg-green-100 text-green-700 border-green-200" },
  { email: "kofi@multipos.com", label: "Manager (Kumasi)", role: "manager", color: "bg-amber-100 text-amber-700 border-amber-200" },
];

export const LoginPage: React.FC = () => {
  const login = usePOSStore(s => s.login);
  const [email, setEmail] = useState("admin@multipos.com");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(email, password);
    if (!ok) setError("Invalid credentials or account disabled.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MultiPOS</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-4">
            Multi-Store<br />
            <span className="text-indigo-400">Point of Sale</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mb-10">
            Manage multiple branches, track inventory, process sales, and analyze performance — all from one powerful platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Stores Managed", value: "3+" },
              { label: "Daily Transactions", value: "500+" },
              { label: "Products Tracked", value: "1,200+" },
              { label: "Uptime", value: "99.9%" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:max-w-lg">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center gap-2 mb-2 lg:hidden">
              <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                <ShoppingCart size={16} className="text-white" />
              </div>
              <span className="font-bold text-gray-800">MultiPOS</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6">
              <p className="text-xs font-medium text-gray-500 text-center mb-3">Demo Accounts (any password works)</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    onClick={() => setEmail(acc.email)}
                    className={`text-left px-3 py-2 rounded-xl border text-xs transition hover:shadow-sm ${acc.color} ${email === acc.email ? "ring-2 ring-indigo-400" : ""}`}
                  >
                    <p className="font-semibold">{acc.label}</p>
                    <p className="opacity-70 truncate">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
