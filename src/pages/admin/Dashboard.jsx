// admin/Dashboard.jsx
// ─────────────────────────────────────────────────────────────
// Main dashboard — stat cards, recent orders, quick actions.
// Also exports AdminShell (sidebar + topbar) used by all admin pages.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag,
  Star, LogOut, Menu as MenuIcon, X,
  TrendingUp, Clock, CheckCircle, XCircle,
} from "lucide-react";

// ── design tokens ────────────────────────────────────────────
export const C = {
  bg:      "#FFF8F0",
  dark:    "#1A0A00",
  mid:     "#2D1400",
  red:     "#D44B1A",
  gold:    "#F5A623",
  muted:   "#8B6A4F",
  border:  "#E8D5C0",
  card:    "#FFFFFF",
  green:   "#16A34A",
  amber:   "#D97706",
  f1:      "'Playfair Display', serif",
  f2:      "'DM Sans', sans-serif",
  sidebar: "#1A0A00",
};

// ── nav items ────────────────────────────────────────────────
export const NAV = [
  { key:"dashboard", label:"Dashboard",      icon:LayoutDashboard },
  { key:"menu",      label:"Manage Menu",    icon:UtensilsCrossed },
  { key:"orders",    label:"Manage Orders",  icon:ShoppingBag     },
  { key:"reviews",   label:"Manage Reviews", icon:Star            },
];

// ── mock data (replace with API calls) ──────────────────────
const STATS = [
  { label:"Today's Orders",   value:"12",  sub:"+3 from yesterday",  icon:"🛒", color:C.red   },
  { label:"Pending",          value:"4",   sub:"Awaiting confirmation", icon:"⏳", color:C.amber },
  { label:"Completed Today",  value:"8",   sub:"₹3,240 revenue",     icon:"✅", color:C.green },
  { label:"Pending Reviews",  value:"3",   sub:"Awaiting approval",  icon:"⭐", color:C.gold  },
];

const RECENT_ORDERS = [
  { id:"#1042", customer:"Priya S.",  items:"Margherita Pizza × 2",      total:"₹418", status:"Delivered",  time:"12 min ago" },
  { id:"#1041", customer:"Rahul M.",  items:"Paneer Pizza, Mango Ice Cream", total:"₹339", status:"Preparing", time:"28 min ago" },
  { id:"#1040", customer:"Anita K.",  items:"Veg Bake × 3, Bread",       total:"₹307", status:"Confirmed",  time:"45 min ago" },
  { id:"#1039", customer:"Suresh P.", items:"Custom Cake (1kg Chocolate)",total:"₹450", status:"Delivered",  time:"1 hr ago"   },
  { id:"#1038", customer:"Meena R.",  items:"Butterscotch Cake, Ice Cream ×2", total:"₹440", status:"Delivered", time:"2 hr ago" },
];

const STATUS_STYLE = {
  Delivered:  { bg:"#DCFCE7", color:"#166534" },
  Preparing:  { bg:"#FEF9C3", color:"#854D0E" },
  Confirmed:  { bg:"#DBEAFE", color:"#1E40AF" },
  Cancelled:  { bg:"#FEE2E2", color:"#991B1B" },
};

// ── AdminShell (exported — used by all admin pages) ──────────
export function AdminShell({ page, onNavigate, onLogout, children }) {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div style={{ display:"flex", flexDirection:"column", height:"100%" }}>
      {/* Brand */}
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily:C.f1, color:C.gold, fontSize:20, fontWeight:700 }}>VK Bakes</div>
        <div style={{ fontFamily:C.f2, color:C.red,  fontSize:10, letterSpacing:3, marginTop:2 }}>ADMIN PANEL</div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"16px 12px" }}>
        {NAV.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => { onNavigate(key); setOpen(false); }}
            style={{
              width:        "100%",
              display:      "flex",
              alignItems:   "center",
              gap:          10,
              padding:      "11px 12px",
              borderRadius: 8,
              marginBottom: 4,
              fontFamily:   C.f2,
              fontSize:     14,
              fontWeight:   page === key ? 700 : 400,
              color:        page === key ? C.dark : "#C8A882",
              background:   page === key ? C.gold : "transparent",
              transition:   "all 0.15s",
              textAlign:    "left",
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding:"16px 12px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={onLogout}
          style={{
            width:"100%", display:"flex", alignItems:"center", gap:10,
            padding:"11px 12px", borderRadius:8,
            fontFamily:C.f2, fontSize:14, color:"#8B6A4F",
          }}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; background: none; }
        input, select, textarea { font-family: inherit; outline: none; }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", fontFamily:C.f2, background:C.bg }}>

        {/* Sidebar — desktop */}
        <aside style={{
          width:       240,
          background:  C.sidebar,
          flexShrink:  0,
          position:    "sticky",
          top:         0,
          height:      "100vh",
          overflowY:   "auto",
          display:     window.innerWidth < 768 ? "none" : "flex",
          flexDirection: "column",
        }}>
          <SidebarContent />
        </aside>

        {/* Mobile drawer overlay */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:40 }}
          />
        )}

        {/* Mobile drawer */}
        <aside style={{
          position:   "fixed",
          top:        0,
          left:       open ? 0 : -260,
          width:      240,
          height:     "100vh",
          background: C.sidebar,
          zIndex:     50,
          transition: "left 0.25s ease",
          display:    "flex",
          flexDirection: "column",
        }}>
          <button
            onClick={() => setOpen(false)}
            style={{ position:"absolute", top:14, right:14, color:"#8B6A4F", display:"flex" }}
          >
            <X size={18} />
          </button>
          <SidebarContent />
        </aside>

        {/* Main */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
          {/* Topbar */}
          <header style={{
            background:     C.card,
            borderBottom:   `1px solid ${C.border}`,
            padding:        "14px 20px",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            position:       "sticky",
            top:            0,
            zIndex:         30,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button onClick={() => setOpen(true)} style={{ display:"flex", color:C.mid }}>
                <MenuIcon size={20} />
              </button>
              <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:15 }}>
                {NAV.find(n => n.key === page)?.label || "Dashboard"}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:C.red,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:C.f2, fontWeight:700, color:"white", fontSize:13 }}>
                VK
              </div>
            </div>
          </header>

          {/* Page content */}
          <main style={{ flex:1, padding:"24px 20px", overflowY:"auto" }}>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }) {
  return (
    <div style={{
      background:   C.card,
      border:       `1px solid ${C.border}`,
      borderRadius: 12,
      padding:      "20px",
      display:      "flex",
      gap:          16,
      alignItems:   "flex-start",
    }}>
      <div style={{
        width:        48,
        height:       48,
        borderRadius: 12,
        background:   `${color}18`,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "center",
        fontSize:     24,
        flexShrink:   0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:26, lineHeight:1.1 }}>
          {value}
        </div>
        <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginTop:3 }}>
          {label}
        </div>
        <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, marginTop:2 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}

// ── Dashboard page ───────────────────────────────────────────
export default function Dashboard() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

      {/* Welcome */}
      <div>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:26, fontWeight:700 }}>
          Good morning! 👋
        </h2>
        <p style={{ fontFamily:C.f2, color:C.muted, fontSize:13, marginTop:4 }}>
          Here's what's happening at VK Bakes & Pizza House today.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Recent orders */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:15 }}>
            Recent Orders
          </span>
          <span style={{ fontFamily:C.f2, fontSize:12, color:C.red, fontWeight:600 }}>
            View all →
          </span>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#FFF8F4" }}>
                {["Order", "Customer", "Items", "Total", "Status", "Time"].map(h => (
                  <th key={h} style={{
                    padding:   "10px 16px",
                    fontFamily: C.f2,
                    fontSize:   11,
                    fontWeight: 700,
                    color:      C.muted,
                    letterSpacing: 1,
                    textAlign:  "left",
                    whiteSpace: "nowrap",
                  }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_ORDERS.map((o, i) => (
                <tr key={o.id} style={{ borderTop:`1px solid ${C.border}`, background:i%2?"white":"#FEFAF7" }}>
                  <td style={{ padding:"12px 16px", fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:13 }}>{o.id}</td>
                  <td style={{ padding:"12px 16px", fontFamily:C.f2, color:C.mid, fontSize:13, whiteSpace:"nowrap" }}>{o.customer}</td>
                  <td style={{ padding:"12px 16px", fontFamily:C.f2, color:C.muted, fontSize:12, maxWidth:200 }}>{o.items}</td>
                  <td style={{ padding:"12px 16px", fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:13, whiteSpace:"nowrap" }}>{o.total}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{
                      ...(STATUS_STYLE[o.status] || STATUS_STYLE.Confirmed),
                      padding:      "3px 10px",
                      borderRadius: 20,
                      fontSize:     11,
                      fontFamily:   C.f2,
                      fontWeight:   600,
                    }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ padding:"12px 16px", fontFamily:C.f2, color:C.muted, fontSize:12, whiteSpace:"nowrap" }}>{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px" }}>
        <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:15, marginBottom:14 }}>Quick Actions</div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {[
            { label:"Add Menu Item",    emoji:"➕", color:C.red   },
            { label:"Mark All Delivered", emoji:"✅", color:C.green },
            { label:"Approve Reviews",  emoji:"⭐", color:C.gold  },
            { label:"View WhatsApp",    emoji:"💬", color:"#25D366" },
          ].map(a => (
            <button key={a.label} style={{
              display:      "flex",
              alignItems:   "center",
              gap:          8,
              padding:      "10px 16px",
              border:       `1px solid ${C.border}`,
              borderRadius: 8,
              fontFamily:   C.f2,
              fontSize:     13,
              fontWeight:   600,
              color:        C.mid,
              background:   "white",
            }}>
              <span>{a.emoji}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}