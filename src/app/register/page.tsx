"use client";
import React, { useState } from "react";
import {
  ShoppingCart, User, Building2, CreditCard, Store,
  CheckCircle, ArrowRight, ArrowLeft, Eye, EyeOff,
  Zap, Package, BarChart3, Lock, Mail, AlertCircle
} from "lucide-react";

type Plan = "starter" | "pro" | "enterprise";

interface FormData {
  name: string; email: string; password: string;
  orgName: string;
  plan: Plan;
  storeName: string; storeLocation: string; currency: string;
}

const PLANS = [
  { id: "starter" as Plan, name: "Starter", price: 29, limits: "1 store · 500 products · 5 staff", gradient: "from-indigo-500 to-blue-600", features: ["Full POS terminal", "Inventory management", "Sales reports", "Email support"] },
  { id: "pro" as Plan, name: "Pro", price: 79, limits: "5 stores · Unlimited products · 25 staff", gradient: "from-violet-500 to-purple-600", popular: true, features: ["Everything in Starter", "5 stores", "Purchase orders", "Priority support"] },
  { id: "enterprise" as Plan, name: "Enterprise", price: 199, limits: "Unlimited everything", gradient: "from-amber-500 to-orange-500", features: ["Everything in Pro", "Unlimited locations", "Dedicated manager", "24/7 support"] },
];

const STEP_LABELS = ["Account", "Business", "Plan", "Your Store"];
const STEP_ICONS = [User, Building2, CreditCard, Store];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "", email: "", password: "",
    orgName: "",
    plan: "pro",
    storeName: "", storeLocation: "", currency: "GHS",
  });

  const upd = (key: keyof FormData, val: string) => setForm(f => ({ ...f, [key]: val }));

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.name.trim()) { setError("Please enter your full name"); return false; }
      if (!form.email.trim() || !form.email.includes("@")) { setError("Please enter a valid email"); return false; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters"); return false; }
    }
    if (step === 2 && !form.orgName.trim()) { setError("Please enter your business name"); return false; }
    if (step === 4) {
      if (!form.storeName.trim()) { setError("Please enter a store name"); return false; }
      if (!form.storeLocation.trim()) { setError("Please enter a location"); return false; }
    }
    return true;
  };

  const next = () => { if (validateStep()) setStep(s => Math.min(5, s + 1)); };
  const back = () => { setError(""); setStep(s => Math.max(1, s - 1)); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed. Please try again."); setLoading(false); return; }

      // Auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      setStep(5);
      setTimeout(() => { window.location.href = loginRes.ok ? "/dashboard" : "/login"; }, 2500);
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 flex relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full filter blur-[120px]" />
      </div>

      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative z-10">
        <a href="/" className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <ShoppingCart size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">MultiPOS</span>
        </a>
        <h2 className="text-4xl font-black text-white mb-4 leading-tight">
          Start managing your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">retail business smarter</span>
        </h2>
        <p className="text-slate-400 text-base mb-10 leading-relaxed max-w-sm">
          Join thousands of retailers using MultiPOS to run their stores. 14-day trial, no card needed.
        </p>
        <div className="space-y-4">
          {[
            { icon: Zap, label: "Up and running in minutes" },
            { icon: Package, label: "Real-time inventory across all stores" },
            { icon: BarChart3, label: "Detailed reports and analytics" },
            { icon: Lock, label: "Enterprise-grade security" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-indigo-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:max-w-xl relative z-10">
        <div className="w-full max-w-md">
          <a href="/" className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">MultiPOS</span>
          </a>

          {step < 5 && (
            <>
              {/* Step indicators */}
              <div className="flex items-center gap-2 mb-8">
                {STEP_LABELS.map((label, i) => {
                  const StepIcon = STEP_ICONS[i];
                  const num = i + 1;
                  const done = step > num;
                  const active = step === num;
                  return (
                    <React.Fragment key={num}>
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white ring-4 ring-indigo-500/30" : "bg-white/10 text-white/40"}`}>
                          {done ? <CheckCircle size={14} /> : <StepIcon size={14} />}
                        </div>
                        <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-white" : done ? "text-emerald-400" : "text-white/30"}`}>{label}</span>
                      </div>
                      {i < STEP_LABELS.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded-full mb-4 transition-colors ${step > num ? "bg-emerald-500" : "bg-white/10"}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                {/* Step 1 */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">Create your account</h3>
                      <p className="text-white/50 text-sm mt-1">Start with your personal details</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Full Name</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input value={form.name} onChange={e => upd("name", e.target.value)} className={`${inputCls} pl-10`} placeholder="John Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type="email" value={form.email} onChange={e => upd("email", e.target.value)} className={`${inputCls} pl-10`} placeholder="you@company.com" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Password</label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type={showPassword ? "text" : "password"} value={form.password} onChange={e => upd("password", e.target.value)} className={`${inputCls} pl-10 pr-12`} placeholder="Min. 8 characters" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">Your business</h3>
                      <p className="text-white/50 text-sm mt-1">Tell us about your organization</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Business Name</label>
                      <div className="relative">
                        <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input value={form.orgName} onChange={e => upd("orgName", e.target.value)} className={`${inputCls} pl-10`} placeholder="e.g. Acme Retail Co." />
                      </div>
                    </div>
                    {form.orgName && (
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                        <p className="text-xs text-indigo-300 font-medium">
                          Your workspace: <span className="font-bold text-indigo-200">multipos.app/{form.orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
                        </p>
                      </div>
                    )}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-white/50 text-xs leading-relaxed">Your organization is your central workspace. All your stores, staff, and data live under this name.</p>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Choose your plan</h3>
                      <p className="text-white/50 text-sm mt-1">14-day free trial · No credit card required</p>
                    </div>
                    {PLANS.map(plan => (
                      <button key={plan.id} onClick={() => upd("plan", plan.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${form.plan === plan.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                              <Store size={16} className="text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{plan.name}</span>
                                {plan.popular && <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full border border-purple-500/30">Popular</span>}
                              </div>
                              <span className="text-xs text-white/40">{plan.limits}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-black text-white">${plan.price}</span>
                            <span className="text-white/40 text-xs">/mo</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xl font-bold text-white">Set up your first store</h3>
                      <p className="text-white/50 text-sm mt-1">You can add more stores from the dashboard</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Store Name</label>
                      <input value={form.storeName} onChange={e => upd("storeName", e.target.value)} className={inputCls} placeholder="e.g. Main Branch" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Location / Address</label>
                      <input value={form.storeLocation} onChange={e => upd("storeLocation", e.target.value)} className={inputCls} placeholder="e.g. Accra, Ghana" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-white/70 uppercase tracking-wider block mb-1.5">Currency</label>
                      <select value={form.currency} onChange={e => upd("currency", e.target.value)} className={`${inputCls} appearance-none cursor-pointer`}>
                        <option value="GHS" className="bg-slate-900">GHS — Ghanaian Cedi</option>
                        <option value="USD" className="bg-slate-900">USD — US Dollar</option>
                        <option value="EUR" className="bg-slate-900">EUR — Euro</option>
                        <option value="NGN" className="bg-slate-900">NGN — Nigerian Naira</option>
                        <option value="KES" className="bg-slate-900">KES — Kenyan Shilling</option>
                      </select>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className={`flex gap-3 mt-6 ${step > 1 ? "justify-between" : "justify-end"}`}>
                  {step > 1 && (
                    <button onClick={back} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-semibold hover:bg-white/5 transition">
                      <ArrowLeft size={14} /> Back
                    </button>
                  )}
                  {step < 4 ? (
                    <button onClick={next} className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 transition">
                      Continue <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-60">
                      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {loading ? "Creating account..." : "Launch my account"}
                    </button>
                  )}
                </div>
              </div>

              <p className="text-center text-white/40 text-xs mt-5">
                Already have an account?{" "}
                <a href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition">Sign in</a>
              </p>
            </>
          )}

          {/* Success */}
          {step === 5 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/40 animate-bounce">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">You&apos;re all set! 🎉</h2>
              <p className="text-slate-400 text-base mb-4">
                Welcome to MultiPOS, <span className="text-white font-semibold">{form.name.split(" ")[0]}</span>! Your 14-day trial has started.
              </p>
              <p className="text-white/30 text-sm">Redirecting to your dashboard...</p>
              <div className="mt-6 flex justify-center">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
