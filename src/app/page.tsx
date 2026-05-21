"use client";
import React, { useState } from "react";
import {
  ShoppingCart, BarChart3, Package, Users, Store, Zap,
  CheckCircle, Star, ArrowRight, Menu, X, ChevronDown,
  Shield, Globe
} from "lucide-react";

interface PricingPlan {
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  gradient: string;
  popular?: boolean;
  limits: string;
  features: string[];
}

const plans: PricingPlan[] = [
  {
    name: "Starter",
    price: { monthly: 29, annual: 24 },
    description: "Perfect for single-location shops.",
    gradient: "from-indigo-500 to-blue-600",
    limits: "1 store · 500 products · 5 staff",
    features: ["Full POS terminal", "Inventory management", "Customer management", "Sales reports", "Receipt printing", "Email support"],
  },
  {
    name: "Pro",
    price: { monthly: 79, annual: 66 },
    description: "For growing multi-branch businesses.",
    gradient: "from-violet-500 to-purple-600",
    popular: true,
    limits: "5 stores · Unlimited products · 25 staff",
    features: ["Everything in Starter", "5 store locations", "Purchase orders", "Advanced analytics", "Supplier management", "Priority support"],
  },
  {
    name: "Enterprise",
    price: { monthly: 199, annual: 166 },
    description: "For large retail chains & franchises.",
    gradient: "from-amber-500 to-orange-500",
    limits: "Unlimited stores · Unlimited products · Unlimited staff",
    features: ["Everything in Pro", "Unlimited locations", "Dedicated account manager", "Custom integrations", "SLA guarantee", "24/7 phone support"],
  },
];

const features = [
  { icon: Store, title: "Multi-Store Management", desc: "Manage unlimited locations from one dashboard. Switch between stores instantly.", color: "bg-indigo-500/10 text-indigo-600" },
  { icon: Zap, title: "Lightning-Fast POS", desc: "Process sales in seconds. Barcode scanning, multiple payment methods, instant receipts.", color: "bg-amber-500/10 text-amber-600" },
  { icon: Package, title: "Real-Time Inventory", desc: "Live stock tracking across all branches. Automatic low-stock alerts before you run out.", color: "bg-emerald-500/10 text-emerald-600" },
  { icon: BarChart3, title: "Powerful Analytics", desc: "Revenue trends, top products, cashier performance. Make data-driven decisions.", color: "bg-purple-500/10 text-purple-600" },
  { icon: Users, title: "Team & Roles", desc: "Cashiers, managers, store admins. Granular permissions so everyone sees only what they need.", color: "bg-rose-500/10 text-rose-600" },
  { icon: Shield, title: "Enterprise Security", desc: "Encrypted passwords, role-based access, full audit trails. Your data is always safe.", color: "bg-cyan-500/10 text-cyan-600" },
];

const testimonials = [
  { name: "Kwame A.", role: "Owner, Accra Electronics Hub", quote: "MultiPOS helped us manage 3 branches without the chaos. Revenue is up 23% since switching.", rating: 5, initials: "KA" },
  { name: "Amara S.", role: "Operations, FreshMart Supermarkets", quote: "The inventory alerts alone saved us thousands. We never run out of fast-moving products anymore.", rating: 5, initials: "AS" },
  { name: "Kofi M.", role: "CEO, StyleHub Clothing", quote: "Onboarded our entire team in an afternoon. The POS is so intuitive, even new cashiers love it.", rating: 5, initials: "KM" },
];

const faqs = [
  { q: "Can I try MultiPOS before paying?", a: "Yes! Every plan includes a 14-day free trial, no credit card required. You'll have full access to all features during your trial." },
  { q: "What happens when my trial ends?", a: "You'll be prompted to enter payment details to continue. If you don't upgrade, your account will be paused — your data is never deleted." },
  { q: "Can I change my plan anytime?", a: "Absolutely. Upgrade, downgrade, or cancel at any time from your billing dashboard. Changes take effect immediately." },
  { q: "Do you support African currencies?", a: "Yes. MultiPOS supports GHS, USD, EUR, NGN, KES, and more. Set a different currency per store location." },
  { q: "Is my data backed up?", a: "Your data is stored on enterprise-grade cloud infrastructure (Neon PostgreSQL) with automatic daily backups and 99.9% uptime SLA." },
];

export default function LandingPage() {
  const [annual, setAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <ShoppingCart size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">MultiPOS</span>
            </a>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Pricing</a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">Testimonials</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition px-3 py-2">Sign in</a>
              <a href="/register" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 transition flex items-center gap-1.5">
                Start Free Trial <ArrowRight size={14} />
              </a>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-100 py-4 space-y-3">
              {["#features", "#pricing", "#testimonials", "#faq"].map((href, i) => (
                <a key={href} href={href} className="block text-sm font-medium text-slate-700 hover:text-indigo-600 px-2 py-1" onClick={() => setMobileMenuOpen(false)}>
                  {["Features", "Pricing", "Testimonials", "FAQ"][i]}
                </a>
              ))}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                <a href="/login" className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-2 py-2">Sign in</a>
                <a href="/register" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl text-center">Start Free Trial →</a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 pt-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-purple-600/20 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
          <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-cyan-600/10 rounded-full filter blur-[80px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wider uppercase">14-Day Free Trial · No Credit Card</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            The POS System Built<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              For Growing Businesses
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-400 leading-relaxed mb-10">
            Manage multiple store locations, process sales, track inventory in real-time, and
            analyze your business performance — all from one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/register" className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl shadow-indigo-500/30 transition-all duration-200 text-lg hover:scale-105 active:scale-[0.98]">
              Start Free Trial <ArrowRight size={18} />
            </a>
            <a href="/login" className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-base">
              Sign In to Dashboard
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16">
            {[
              { label: "Stores Managed", value: "2,400+" },
              { label: "Daily Transactions", value: "50k+" },
              { label: "Revenue Processed", value: "$12M+" },
              { label: "Uptime", value: "99.9%" },
            ].map(s => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-2xl sm:text-3xl font-black text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-white/30" size={28} />
        </div>
      </section>

      {/* ── SOCIAL PROOF ──────────────────────────────────────────── */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by businesses across Africa & beyond</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {["Accra Electronics Hub", "FreshMart Supermarkets", "StyleHub Clothing", "Kumasi Tech Store", "Lagos Gadget World"].map(brand => (
              <span key={brand} className="text-sm font-bold text-slate-300 tracking-wide">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 block">Everything you need</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Built for retail, designed to scale</h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">From your first sale to your hundredth location — MultiPOS grows with you.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group p-7 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${color}`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 block">Simple, transparent pricing</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Start free. Scale as you grow.</h2>
            <p className="mt-4 text-lg text-slate-500">14-day free trial on all plans. No credit card required.</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={`text-sm font-semibold ${!annual ? "text-slate-900" : "text-slate-400"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${annual ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-semibold ${annual ? "text-slate-900" : "text-slate-400"}`}>
              Annual <span className="text-emerald-500 font-bold">(Save 17%)</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 border-2 transition-all duration-300 flex flex-col ${
                  plan.popular
                    ? "border-purple-500 shadow-2xl shadow-purple-500/20 scale-105 bg-white"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-5 shadow-lg`}>
                  <Store size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                <p className="text-slate-500 text-sm mt-1 mb-5">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-5xl font-black text-slate-900">GH₵{annual ? plan.price.annual : plan.price.monthly}</span>
                  <span className="text-slate-400 font-medium">/mo</span>
                </div>
                {annual && <p className="text-xs text-emerald-500 font-semibold mb-4">Billed annually (save GH₵{(plan.price.monthly - plan.price.annual) * 12}/yr)</p>}
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5 pb-5 border-b border-slate-100">{plan.limits}</p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-700 font-medium">
                      <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/register"
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm text-center transition-all duration-200 ${
                    plan.popular
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:from-violet-600 hover:to-purple-700"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  Start Free Trial →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────── */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 block">Loved by retailers</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">What our customers say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.name} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-3 block">Got questions?</span>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">Frequently asked</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition"
                >
                  <span className="font-bold text-slate-900 text-sm">{faq.q}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-50%] left-[-20%] w-[60%] h-[200%] bg-white/5 rounded-full" />
          <div className="absolute top-[-50%] right-[-20%] w-[60%] h-[200%] bg-white/5 rounded-full" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to transform your retail business?
          </h2>
          <p className="text-indigo-200 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of retailers using MultiPOS. Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/register" className="flex items-center gap-2 bg-white text-indigo-600 font-bold px-8 py-4 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all duration-200 text-base hover:scale-105">
              Start Free Trial <ArrowRight size={16} />
            </a>
            <a href="/login" className="flex items-center gap-2 border border-white/30 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/10 transition text-base">
              Sign In
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart size={15} className="text-white" />
                </div>
                <span className="font-bold text-white">MultiPOS</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                The modern Point of Sale system for multi-location retail businesses across Africa and beyond.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Product</h4>
              <ul className="space-y-2.5">
                {["Features", "Pricing", "Changelog", "Roadmap"].map(l => (
                  <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["About", "Blog", "Contact", "Privacy Policy", "Terms of Service"].map(l => (
                  <li key={l}><a href="#" className="text-slate-400 text-sm hover:text-white transition">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© 2025 MultiPOS. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Globe size={13} /> <span>Available in 10+ countries</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
