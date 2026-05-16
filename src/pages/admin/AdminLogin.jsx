// admin/AdminLogin.jsx
// ─────────────────────────────────────────────────────────────
// Login page for VK Bakes & Pizza House admin panel.
// Uses authStore for backend authentication.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";

// ── design tokens (same as main app) ────────────────────────
const C = {
  bg:     "#FFF8F0",
  dark:   "#1A0A00",
  mid:    "#2D1400",
  red:    "#D44B1A",
  gold:   "#F5A623",
  muted:  "#8B6A4F",
  border: "#E8D5C0",
  f1:     "'Playfair Display', serif",
  f2:     "'DM Sans', sans-serif",
};

// ─────────────────────────────────────────────────────────────
export default function AdminLogin({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);

  const { login, loading, error, clearError } = useAuthStore();

  const submit = async () => {
    clearError();
    if (!user || !pass) {
      // Handle validation error locally since authStore expects valid input
      return;
    }

    const result = await login(user, pass);
    if (result.success) {
      sessionStorage.setItem("vk_admin_auth", "true");
      onLogin();
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; background: none; }
        input  { font-family: inherit; outline: none; }
      `}</style>

      <div style={{
        minHeight:   "100vh",
        background:  `linear-gradient(145deg, ${C.dark} 0%, #3D1A00 100%)`,
        display:     "flex",
        alignItems:  "center",
        justifyContent: "center",
        padding:     "24px 16px",
        fontFamily:  C.f2,
      }}>
        {/* Decorative background blobs */}
        <div style={{ position:"fixed", top:-80, right:-80, width:300, height:300,
          borderRadius:"50%", background:"rgba(212,75,26,0.12)", pointerEvents:"none" }} />
        <div style={{ position:"fixed", bottom:-60, left:-60, width:240, height:240,
          borderRadius:"50%", background:"rgba(245,166,35,0.08)", pointerEvents:"none" }} />

        <div style={{ width:"100%", maxWidth:400 }}>
          {/* Brand */}
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ fontSize:48, marginBottom:12 }}>🍕</div>
            <h1 style={{ fontFamily:C.f1, color:C.gold, fontSize:30, fontWeight:700, lineHeight:1.1 }}>
              VK Bakes
            </h1>
            <div style={{ color:C.red, fontFamily:C.f2, fontSize:11, letterSpacing:4, marginTop:4 }}>
              ADMIN PANEL
            </div>
          </div>

          {/* Card */}
          <div style={{
            background:   "rgba(255,255,255,0.04)",
            border:       "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16,
            padding:      "32px 28px",
            backdropFilter: "blur(12px)",
          }}>
            <h2 style={{ color:"#FFF8F0", fontSize:18, fontWeight:700, marginBottom:6 }}>
              Sign in
            </h2>
            <p style={{ color:C.muted, fontSize:13, marginBottom:24 }}>
              Access your bakery dashboard
            </p>

            {/* Error */}
            {error && (
              <div style={{
                background:   "rgba(212,75,26,0.15)",
                border:       "1px solid rgba(212,75,26,0.4)",
                borderRadius: 8,
                padding:      "10px 13px",
                display:      "flex",
                gap:          8,
                alignItems:   "flex-start",
                marginBottom: 18,
              }}>
                <AlertCircle size={14} color={C.red} style={{ flexShrink:0, marginTop:1 }} />
                <span style={{ color:"#FFB39A", fontSize:13 }}>{error}</span>
              </div>
            )}

            {/* Username */}
            <div style={{ marginBottom:14 }}>
              <label style={{ color:"#C8A882", fontSize:12, fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>
                USERNAME
              </label>
              <div style={{
                display:      "flex",
                alignItems:   "center",
                background:   "rgba(255,255,255,0.06)",
                border:       `1px solid ${error ? "rgba(212,75,26,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding:      "0 13px",
                gap:          10,
              }}>
                <User size={15} color="#8B6A4F" />
                <input
                  type="text"
                  value={user}
                  onChange={e => setUser(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Enter username"
                  style={{
                    flex:       1,
                    padding:    "12px 0",
                    background: "transparent",
                    color:      "#FFF8F0",
                    fontSize:   14,
                    border:     "none",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:24 }}>
              <label style={{ color:"#C8A882", fontSize:12, fontWeight:600, letterSpacing:1, display:"block", marginBottom:6 }}>
                PASSWORD
              </label>
              <div style={{
                display:      "flex",
                alignItems:   "center",
                background:   "rgba(255,255,255,0.06)",
                border:       `1px solid ${error ? "rgba(212,75,26,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding:      "0 13px",
                gap:          10,
              }}>
                <Lock size={15} color="#8B6A4F" />
                <input
                  type={show ? "text" : "password"}
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Enter password"
                  style={{
                    flex:       1,
                    padding:    "12px 0",
                    background: "transparent",
                    color:      "#FFF8F0",
                    fontSize:   14,
                    border:     "none",
                  }}
                />
                <button onClick={() => setShow(s => !s)} style={{ color:"#8B6A4F", display:"flex" }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={submit}
              disabled={loading}
              style={{
                width:        "100%",
                padding:      "13px",
                background:   loading ? "#A0401A" : C.red,
                color:        "white",
                borderRadius: 8,
                fontFamily:   C.f2,
                fontWeight:   700,
                fontSize:     15,
                transition:   "background 0.2s",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
                gap:          8,
              }}
            >
              {loading ? (
                <>
                  <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.3)",
                    borderTopColor:"white", borderRadius:"50%", display:"inline-block",
                    animation:"spin 0.7s linear infinite" }} />
                  Signing in…
                </>
              ) : "Sign In →"}
            </button>
          </div>

          <p style={{ textAlign:"center", color:"rgba(139,106,79,0.6)", fontSize:11, marginTop:20 }}>
            VK Bakes & Pizza House · Admin Panel
          </p>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}