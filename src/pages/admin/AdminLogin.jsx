// admin/AdminLogin.jsx
import { useState } from "react";
import { Eye, EyeOff, Lock, User, AlertCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);

  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const submit = async () => {
    clearError();
    if (!user || !pass) return;
    const result = await login(user, pass);
    if (result?.success) {
      sessionStorage.setItem("vk_admin_auth", "true");
      navigate("/admin");
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") submit(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A0A00] to-[#3D1A00] flex items-center justify-center px-4 py-8 font-sans">

      {/* BG blobs */}
      <div className="fixed top-0 right-0 w-72 h-72 rounded-full bg-[#D44B1A]/10 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-56 h-56 rounded-full bg-[#F5A623]/8 translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍕</div>
          <h1 className="font-serif text-[#F5A623] text-3xl font-bold leading-tight">
            VK Bakes
          </h1>
          <p className="text-[#D44B1A] text-[11px] tracking-[4px] mt-1 font-bold">
            ADMIN PANEL
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-7 py-8 backdrop-blur-md">
          <h2 className="text-[#FFF8F0] text-lg font-bold mb-1">Sign in</h2>
          <p className="text-[#8B6A4F] text-sm mb-6">Access your bakery dashboard</p>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-[#D44B1A]/15 border border-[#D44B1A]/40 rounded-xl px-3 py-2.5 mb-5">
              <AlertCircle size={14} className="text-[#D44B1A] shrink-0 mt-0.5" />
              <span className="text-[#FFB39A] text-xs">{error}</span>
            </div>
          )}

          {/* Username */}
          <div className="mb-4">
            <label className="text-[#C8A882] text-[11px] font-bold tracking-widest block mb-2">
              USERNAME
            </label>
            <div className={`flex items-center gap-2.5 bg-white/6 border rounded-xl px-3 ${error ? "border-[#D44B1A]/50" : "border-white/12"}`}>
              <User size={15} className="text-[#8B6A4F] shrink-0" />
              <input
                type="text"
                value={user}
                onChange={e => setUser(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter username"
                className="flex-1 py-3 bg-transparent text-[#FFF8F0] text-sm placeholder:text-[#8B6A4F]/60 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-7">
            <label className="text-[#C8A882] text-[11px] font-bold tracking-widest block mb-2">
              PASSWORD
            </label>
            <div className={`flex items-center gap-2.5 bg-white/6 border rounded-xl px-3 ${error ? "border-[#D44B1A]/50" : "border-white/12"}`}>
              <Lock size={15} className="text-[#8B6A4F] shrink-0" />
              <input
                type={show ? "text" : "password"}
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Enter password"
                className="flex-1 py-3 bg-transparent text-[#FFF8F0] text-sm placeholder:text-[#8B6A4F]/60 outline-none"
              />
              <button
                onClick={() => setShow(s => !s)}
                className="text-[#8B6A4F] hover:text-[#FFF8F0] transition-colors"
              >
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading || !user || !pass}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              loading || !user || !pass
                ? "bg-[#A0401A] cursor-not-allowed opacity-70"
                : "bg-[#D44B1A] hover:bg-[#b83d13] active:scale-95 shadow-lg shadow-[#D44B1A]/30"
            }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in…
              </>
            ) : "Sign In →"}
          </button>
        </div>

        <p className="text-center text-[#8B6A4F]/50 text-[11px] mt-5">
          VK Bakes & Pizza House · Admin Panel
        </p>
      </div>
    </div>
  );
}