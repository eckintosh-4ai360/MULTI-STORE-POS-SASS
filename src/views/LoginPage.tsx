import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import { ShoppingCart, Lock, Mail, AlertCircle } from "lucide-react";

const demoAccounts = [
  { email: "admin@multipos.com", label: "Super Admin", role: "super_admin" },
  { email: "kwame@multipos.com", label: "Store Admin (Accra)", role: "store_admin" },
  { email: "ama@multipos.com", label: "Cashier (Accra)", role: "cashier" },
  { email: "kofi@multipos.com", label: "Manager (Kumasi)", role: "manager" },
];

export const LoginPage: React.FC = () => {
  const login = usePOSStore(s => s.login);
  const [email, setEmail] = useState("admin@multipos.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    // Add a slight realistic latency feel
    await new Promise(r => setTimeout(r, 600));
    const ok = await login(email, password);
    if (!ok) setError("Invalid credentials or account disabled.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 flex relative overflow-hidden">
      {/* Background Animated Orbs */}
      <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">MultiPOS</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Multi-Store<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">POS Terminal</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
            Manage multiple branches, track real-time inventory, process retail sales, and analyze business performance — all from one premium dashboard.
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: "Stores Managed", value: "3+" },
              { label: "Daily Transactions", value: "500+" },
              { label: "Products Tracked", value: "1,200+" },
              { label: "System Uptime", value: "99.9%" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-md">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 lg:max-w-xl relative z-10">
        <div className="w-full max-w-md">
          <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl animate-scaleIn">
            <div className="flex items-center gap-2.5 mb-6 lg:hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">MultiPOS</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome back</h2>
            <p className="text-white/60 text-sm mb-6">Sign in to your account to continue</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-white/30 transition-all duration-200"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/80 uppercase tracking-wider block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-white/30 transition-all duration-200"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm animate-fadeIn">
                  <AlertCircle size={16} className="text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-indigo-500/25 border border-white/10 cursor-pointer active:scale-[0.98]"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider text-center mb-3.5">Demo Accounts (Password: password123)</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword("password123");
                    }}
                    className={`text-left px-3 py-2 rounded-xl border text-xs transition duration-200 cursor-pointer ${
                      email === acc.email
                        ? "bg-white/15 border-white/30 text-white ring-1 ring-indigo-400"
                        : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <p className="font-semibold text-white">{acc.label}</p>
                    <p className="opacity-50 truncate mt-0.5">{acc.email}</p>
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
