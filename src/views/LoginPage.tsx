import React, { useState } from "react";
import { usePOSStore } from "../store/posStore";
import { ShoppingCart, Lock, Mail, AlertCircle, Eye, EyeOff, Zap, BarChart3, Globe, Shield } from "lucide-react";

const demoAccounts = [
  { email: "admin@multipos.com", label: "Super Admin", role: "super_admin", color: "#6366f1" },
  { email: "kwame@multipos.com", label: "Store Admin", sublabel: "Accra", role: "store_admin", color: "#8b5cf6" },
  { email: "ama@multipos.com", label: "Cashier", sublabel: "Accra", role: "cashier", color: "#06b6d4" },
  { email: "kofi@multipos.com", label: "Manager", sublabel: "Kumasi", role: "manager", color: "#10b981" },
];

const features = [
  { icon: <BarChart3 size={18} />, text: "Real-time analytics across all stores" },
  { icon: <Globe size={18} />, text: "Multi-branch inventory management" },
  { icon: <Zap size={18} />, text: "Lightning-fast POS terminal" },
  { icon: <Shield size={18} />, text: "Role-based access control" },
];

export const LoginPage: React.FC = () => {
  const login = usePOSStore(s => s.login);
  const currentUser = usePOSStore(s => s.currentUser);
  const _hasHydrated = usePOSStore(s => s._hasHydrated);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // If already logged in (after hydration), go straight to dashboard
  React.useEffect(() => {
    if (_hasHydrated && currentUser) {
      window.location.replace("/dashboard");
    }
  }, [_hasHydrated, currentUser]);

  // Show nothing until we know the hydration state
  if (!_hasHydrated) return null;
  // Already logged in — redirect handled above
  if (currentUser) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(email, password);
    if (ok) {
      window.location.href = "/dashboard";
    } else {
      setError("Invalid credentials or account disabled.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0d1b3e 100%)" }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: "absolute", top: "-20%", left: "-15%",
          width: "55%", height: "55%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(60px)",
          animation: "pulse 6s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", right: "-15%",
          width: "60%", height: "60%",
          background: "radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(80px)",
          animation: "pulse 8s ease-in-out infinite 2s"
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "20%",
          width: "30%", height: "30%",
          background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
          borderRadius: "50%", filter: "blur(60px)",
          animation: "pulse 7s ease-in-out infinite 1s"
        }} />
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} />
      </div>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-center px-16 flex-1 relative z-10">
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
          <div style={{
            width: "48px", height: "48px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(99,102,241,0.4)"
          }}>
            <ShoppingCart size={22} color="white" />
          </div>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: "22px", letterSpacing: "-0.5px", lineHeight: 1 }}>MultiPOS</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", marginTop: "2px" }}>SaaS Platform</div>
          </div>
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 4vw, 56px)",
          fontWeight: 900,
          color: "white",
          lineHeight: 1.1,
          letterSpacing: "-1.5px",
          marginBottom: "20px"
        }}>
          The smarter way<br />
          to run{" "}
          <span style={{
            background: "linear-gradient(90deg, #818cf8, #c084fc, #38bdf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            retail.
          </span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "400px", lineHeight: 1.7, marginBottom: "40px" }}>
          One dashboard to manage every store, every product, every transaction — with the clarity you need to grow.
        </p>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "48px" }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px", height: "36px",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                borderRadius: "10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#818cf8", flexShrink: 0
              }}>
                {f.icon}
              </div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", maxWidth: "400px" }}>
          {[
            { label: "Stores", value: "50+" },
            { label: "Daily Sales", value: "2K+" },
            { label: "Uptime", value: "99.9%" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px", padding: "16px 12px",
              textAlign: "center"
            }}>
              <div style={{ color: "white", fontWeight: 800, fontSize: "22px", letterSpacing: "-0.5px" }}>{stat.value}</div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — Login Card */}
      <div style={{
        flex: "0 0 auto", width: "100%",
        maxWidth: "clamp(340px, 45vw, 520px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "32px 24px", position: "relative", zIndex: 10
      }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <div style={{
              width: "40px", height: "40px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)"
            }}>
              <ShoppingCart size={18} color="white" />
            </div>
            <span style={{ color: "white", fontWeight: 800, fontSize: "20px", letterSpacing: "-0.5px" }}>MultiPOS</span>
          </div>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "28px",
            padding: "40px 36px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)"
          }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{
                color: "white", fontWeight: 800, fontSize: "28px",
                letterSpacing: "-0.8px", marginBottom: "6px", lineHeight: 1.2
              }}>
                Welcome back
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>
                Sign in to access your dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Email */}
              <div>
                <label style={{
                  display: "block", marginBottom: "8px",
                  color: "rgba(255,255,255,0.7)", fontSize: "12px",
                  fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase"
                }}>
                  Email Address
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={15} style={{
                    position: "absolute", left: "14px", top: "50%",
                    transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none"
                  }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    style={{
                      width: "100%", boxSizing: "border-box",
                      paddingLeft: "42px", paddingRight: "16px",
                      paddingTop: "13px", paddingBottom: "13px",
                      background: "rgba(255,255,255,0.07)",
                      border: "1.5px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      color: "white", fontSize: "14px",
                      outline: "none", transition: "border-color 0.2s, background 0.2s"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "rgba(99,102,241,0.8)";
                      e.target.style.background = "rgba(99,102,241,0.08)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.background = "rgba(255,255,255,0.07)";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{
                  display: "block", marginBottom: "8px",
                  color: "rgba(255,255,255,0.7)", fontSize: "12px",
                  fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase"
                }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} style={{
                    position: "absolute", left: "14px", top: "50%",
                    transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)", pointerEvents: "none"
                  }} />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: "100%", boxSizing: "border-box",
                      paddingLeft: "42px", paddingRight: "48px",
                      paddingTop: "13px", paddingBottom: "13px",
                      background: "rgba(255,255,255,0.07)",
                      border: "1.5px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      color: "white", fontSize: "14px",
                      outline: "none", transition: "border-color 0.2s, background 0.2s"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "rgba(99,102,241,0.8)";
                      e.target.style.background = "rgba(99,102,241,0.08)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.background = "rgba(255,255,255,0.07)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: "absolute", right: "14px", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(255,255,255,0.35)", padding: "0",
                      display: "flex", alignItems: "center"
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "12px 14px",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  borderRadius: "12px",
                  color: "#fca5a5", fontSize: "13px"
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, color: "#f87171" }} />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading
                    ? "rgba(99,102,241,0.5)"
                    : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none",
                  borderRadius: "14px",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "15px",
                  letterSpacing: "0.2px",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                  transition: "all 0.2s",
                  transform: "translateY(0)"
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(99,102,241,0.55)";
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(99,102,241,0.4)";
                }}
              >
                {loading && (
                  <span style={{
                    width: "16px", height: "16px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite"
                  }} />
                )}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            {/* Demo accounts */}
            <div style={{ marginTop: "28px" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                marginBottom: "14px"
              }}>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
                <span style={{
                  color: "rgba(255,255,255,0.3)", fontSize: "11px",
                  fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase",
                  whiteSpace: "nowrap"
                }}>
                  Quick Login · password123
                </span>
                <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.08)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {demoAccounts.map(acc => {
                  const isActive = email === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => {
                        setEmail(acc.email);
                        setPassword("password123");
                      }}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        background: isActive ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${isActive ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.07)"}`,
                        borderRadius: "14px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        outline: "none",
                        boxShadow: isActive ? "0 0 0 1px rgba(99,102,241,0.2)" : "none"
                      }}
                      onMouseEnter={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isActive) {
                          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                        }
                      }}
                    >
                      <div style={{
                        display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px"
                      }}>
                        <div style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: isActive ? "#818cf8" : "rgba(255,255,255,0.25)",
                          flexShrink: 0
                        }} />
                        <span style={{
                          color: isActive ? "white" : "rgba(255,255,255,0.75)",
                          fontWeight: 700, fontSize: "12px", lineHeight: 1
                        }}>
                          {acc.label}
                        </span>
                        {acc.sublabel && (
                          <span style={{
                            color: "rgba(255,255,255,0.35)", fontSize: "10px", fontWeight: 500
                          }}>
                            · {acc.sublabel}
                          </span>
                        )}
                      </div>
                      <div style={{
                        color: "rgba(255,255,255,0.35)", fontSize: "11px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {acc.email}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p style={{
            textAlign: "center", marginTop: "20px",
            color: "rgba(255,255,255,0.2)", fontSize: "12px"
          }}>
            © 2025 MultiPOS · Secure & Encrypted
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(99,102,241,0.1) inset !important;
          -webkit-text-fill-color: white !important;
        }
      `}</style>
    </div>
  );
};
