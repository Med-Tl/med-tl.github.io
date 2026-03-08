import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { glassStrong } from "../components/UI";

const BgOrbs = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
    <div style={{ position: "absolute", top: "-15%", left: "-8%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.07) 0%, transparent 68%)" }} />
    <div style={{ position: "absolute", bottom: "-15%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 68%)" }} />
  </div>
);

export default function AuthPage() {
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState("login"); // login | register | reset
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.email) { setError("Email is required."); return; }
    if (mode !== "reset" && !form.password) { setError("Password is required."); return; }
    if (mode === "register" && !form.name) { setError("Name is required."); return; }

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else if (mode === "register") {
        await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      } else {
        await resetPassword(form.email);
        setSuccess("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "No account with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "Email already registered. Sign in instead.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Invalid email address.",
        "auth/invalid-credential": "Invalid email or password.",
      };
      setError(msgs[err.code] || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "#070b14" }}>
      <BgOrbs />
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 460, padding: "0 20px" }}>

        {/* Wordmark */}
        <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: "linear-gradient(135deg, #22d3ee, #6366f1)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
              boxShadow: "0 0 40px rgba(34,211,238,0.35)",
            }}>⚡</div>
            <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", fontFamily: "'Syne', sans-serif" }}>
              PFE<span style={{ color: "#22d3ee" }}>Hub</span>
            </span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, letterSpacing: "0.03em" }}>
            Final Year Project Management Platform
          </p>
        </div>

        {/* Card */}
        <div style={{ ...glassStrong, padding: "36px 38px", animation: "fadeUp 0.5s 0.1s ease both" }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, marginBottom: 4, letterSpacing: "-0.01em" }}>
            {mode === "login" ? "Welcome back" : mode === "register" ? "Create your account" : "Reset password"}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 13, marginBottom: 28 }}>
            {mode === "login" ? "Sign in to your workspace" : mode === "register" ? "Join your class today" : "We'll send a reset link to your email"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && (
              <Field label="Full Name">
                <input className="input-field" type="text" placeholder="e.g. Yasmine Hadj" value={form.name} onChange={set("name")} />
              </Field>
            )}

            <Field label="Email Address">
              <input className="input-field" type="email" placeholder="you@uni.dz" value={form.email} onChange={set("email")} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            </Field>

            {mode !== "reset" && (
              <Field label="Password">
                <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
              </Field>
            )}

            {mode === "register" && (
              <Field label="Role">
                <select className="input-field" value={form.role} onChange={set("role")} style={{ background: "rgba(7,11,20,0.9)" }}>
                  <option value="student">👩‍🎓 Student</option>
                  <option value="admin">👨‍🏫 Teacher / Admin</option>
                </select>
              </Field>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "11px 14px", color: "#f87171", fontSize: 13, lineHeight: 1.4 }}>
                ⚠ {error}
              </div>
            )}
            {success && (
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "11px 14px", color: "#4ade80", fontSize: 13 }}>
                ✓ {success}
              </div>
            )}

            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: "100%", marginTop: 4 }}>
              {loading ? "Please wait…" : mode === "login" ? "Sign In →" : mode === "register" ? "Create Account →" : "Send Reset Link"}
            </button>
          </div>

          {/* Mode switchers */}
          <div style={{ marginTop: 22, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", fontSize: 13 }}>
            {mode !== "login" && (
              <button style={{ background: "none", border: "none", color: "#22d3ee", fontWeight: 700, cursor: "pointer" }} onClick={() => { setMode("login"); setError(""); setSuccess(""); }}>
                Sign In
              </button>
            )}
            {mode !== "register" && (
              <>
                {mode === "login" && <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>}
                <button style={{ background: "none", border: "none", color: "#22d3ee", fontWeight: 700, cursor: "pointer" }} onClick={() => { setMode("register"); setError(""); setSuccess(""); }}>
                  Create Account
                </button>
              </>
            )}
            {mode === "login" && (
              <>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.38)", cursor: "pointer" }} onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}>
                  Forgot password?
                </button>
              </>
            )}
          </div>
        </div>

        {/* Firebase badge */}
        <p style={{ textAlign: "center", marginTop: 18, color: "rgba(255,255,255,0.18)", fontSize: 11, letterSpacing: "0.03em" }}>
          Secured by Firebase Authentication · pfe26-41918
        </p>
      </div>
    </div>
  );
}

const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{label}</label>
    {children}
  </div>
);
