// src/components/Footer.jsx
// ─────────────────────────────────────────────────────────────
// Full-featured footer for VK Bakes & Pizza House.
// Sections: Brand, Quick Links, Menu Categories, Contact, Review form.
// WhatsApp CTA strip at top. Copyright bar at bottom.
// Consistent with main app design tokens.
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  MapPin, Clock, Phone, MessageCircle,
  Star, Send,
  ChevronRight, Heart,
} from "lucide-react";

// ── Design tokens (match main app) ───────────────────────────
const C = {
  bg:     "#FFF8F0",
  dark:   "#1A0A00",
  mid:    "#2D1400",
  footer: "#120600",        // slightly deeper than dark
  panel:  "#1E0C00",
  red:    "#D44B1A",
  gold:   "#F5A623",
  muted:  "#8B6A4F",
  border: "rgba(255,255,255,0.07)",
  green:  "#25D366",
  text:   "#E8D5C0",
  subtle: "#6B4E37",
  f1:     "'Playfair Display', serif",
  f2:     "'DM Sans', sans-serif",
};

const WA = "919999999999"; // ← Replace with your WhatsApp number

// ── Quick links ───────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",         href: "#home"    },
  { label: "Our Menu",     href: "#menu"    },
  { label: "Custom Cake",  href: "#cake"    },
  { label: "Daily Offers", href: "#offers"  },
  { label: "Reviews",      href: "#reviews" },
  { label: "Contact Us",   href: "#contact" },
];

// ── Menu categories ───────────────────────────────────────────
const CATEGORIES = [
  { label: "🍕 Pizzas",        href: "#menu" },
  { label: "🥐 Bakes",         href: "#menu" },
  { label: "🎂 Cakes",         href: "#menu" },
  { label: "🍞 Bread & Toast", href: "#menu" },
  { label: "🍪 Biscuits",      href: "#menu" },
  { label: "🍦 Ice Cream",     href: "#menu" },
];

// ── Store timings ─────────────────────────────────────────────
const TIMINGS = [
  { day: "Mon – Fri",  time: "8:00 AM – 9:00 PM" },
  { day: "Saturday",   time: "8:00 AM – 9:30 PM" },
  { day: "Sunday",     time: "9:00 AM – 8:00 PM"  },
];

// ── Star selector ─────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          style={{ lineHeight: 1, padding: 0 }}
        >
          <Star
            size={20}
            fill={(hover || value) >= n ? C.gold : "none"}
            color={(hover || value) >= n ? C.gold : C.subtle}
            style={{ transition: "all 0.15s" }}
          />
        </button>
      ))}
    </div>
  );
}



// ── Main Footer ───────────────────────────────────────────────
export default function Footer({ onNavigate }) {
  const navigate = (href) => {
    if (onNavigate) onNavigate(href.replace("#", ""));
    else window.location.hash = href;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .footer-link:hover { color: ${C.gold} !important; }
        .footer-link { transition: color 0.15s; }
        .wa-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,211,102,0.35) !important; }
        .wa-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .social-btn:hover { background: rgba(255,255,255,0.10) !important; border-color: rgba(255,255,255,0.2) !important; }
        .social-btn { transition: background 0.15s, border-color 0.15s; }
      `}</style>

      <footer style={{ background: C.footer, fontFamily: C.f2 }}>

        {/* ── WhatsApp CTA strip ───────────────────────────── */}
        <div style={{
          background:     `linear-gradient(135deg, ${C.mid} 0%, #3D1A00 100%)`,
          borderTop:      `1px solid ${C.border}`,
          borderBottom:   `1px solid ${C.border}`,
          padding:        "28px 20px",
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: C.f1, color: "#FFF8F0", fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                Ready to order? 🍕
              </div>
              <div style={{ fontFamily: C.f2, color: C.muted, fontSize: 13 }}>
                Tap below — your order message is ready in one click.
              </div>
            </div>
            <a
              href={`https://wa.me/${WA}`}
              target="_blank"
              rel="noreferrer"
              className="wa-btn"
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          10,
                background:   C.green,
                color:        "white",
                padding:      "13px 24px",
                borderRadius: 10,
                fontFamily:   C.f2,
                fontWeight:   700,
                fontSize:     14,
                textDecoration: "none",
                boxShadow:    "0 4px 14px rgba(37,211,102,0.25)",
                flexShrink:   0,
              }}
            >
              <MessageCircle size={18} />
              Order on WhatsApp
            </a>
          </div>
        </div>

        {/* ── Main footer grid ─────────────────────────────── */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "52px 20px 36px" }}>
          <div style={{
            display:             "grid",
            gridTemplateColumns: "1.4fr 1fr 1fr 1.3fr",
            gap:                 40,
          }}>

            {/* Col 1 — Brand */}
            <div>
              {/* Logo mark */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: C.f1, color: C.gold, fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                  VK Bakes
                </div>
                <div style={{ fontFamily: C.f2, color: C.red, fontSize: 10, letterSpacing: 4, marginTop: 3 }}>
                  & PIZZA HOUSE
                </div>
              </div>

              <p style={{ fontFamily: C.f2, color: C.subtle, fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Your neighborhood bakery since day one. Fresh-baked breads, artisan cakes, and hot pizzas — all made with love for our local community.
              </p>

              {/* Social links */}
              <div style={{ display: "flex", gap: 8 }}>
                {[
                //   { icon: <Instagram size={16} />, label: "Instagram", href: "#" },
                //   { icon: <Facebook  size={16} />, label: "Facebook",  href: "#" },
                  { icon: <MessageCircle size={16} />, label: "WhatsApp", href: `https://wa.me/${WA}` },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="social-btn"
                    title={s.label}
                    style={{
                      width:        36,
                      height:       36,
                      borderRadius: 8,
                      border:       `1px solid ${C.border}`,
                      display:      "flex",
                      alignItems:   "center",
                      justifyContent: "center",
                      color:        C.subtle,
                      background:   "rgba(255,255,255,0.03)",
                      textDecoration: "none",
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>

              {/* Delivery badge */}
              <div style={{
                display:      "inline-flex",
                alignItems:   "center",
                gap:          6,
                marginTop:    18,
                background:   "rgba(37,211,102,0.08)",
                border:       "1px solid rgba(37,211,102,0.2)",
                borderRadius: 20,
                padding:      "5px 12px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
                <span style={{ fontFamily: C.f2, fontSize: 11, color: C.green, fontWeight: 600 }}>
                  Delivering locally
                </span>
              </div>
            </div>

            {/* Col 2 — Quick links */}
            <div>
              <div style={{ fontFamily: C.f2, fontWeight: 700, color: C.text, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>
                QUICK LINKS
              </div>
              <ul style={{ listStyle: "none" }}>
                {NAV_LINKS.map((l) => (
                  <li key={l.label} style={{ marginBottom: 10 }}>
                    <button
                      onClick={() => navigate(l.href)}
                      className="footer-link"
                      style={{
                        fontFamily: C.f2,
                        color:      C.subtle,
                        fontSize:   13,
                        display:    "flex",
                        alignItems: "center",
                        gap:        5,
                        textDecoration: "none",
                      }}
                    >
                      <ChevronRight size={12} color={C.red} />
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Menu categories */}
            <div>
              <div style={{ fontFamily: C.f2, fontWeight: 700, color: C.text, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>
                OUR MENU
              </div>
              <ul style={{ listStyle: "none" }}>
                {CATEGORIES.map((c) => (
                  <li key={c.label} style={{ marginBottom: 10 }}>
                    <button
                      onClick={() => navigate(c.href)}
                      className="footer-link"
                      style={{
                        fontFamily: C.f2,
                        color:      C.subtle,
                        fontSize:   13,
                      }}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${C.border}`, margin: "18px 0" }} />
            </div>

            {/* Col 4 — Contact + Review form */}
            <div>
              <div style={{ fontFamily: C.f2, fontWeight: 700, color: C.text, fontSize: 12, letterSpacing: 2, marginBottom: 16 }}>
                FIND US
              </div>

              {/* Contact details */}
              {[
                {
                  icon: <MapPin size={13} color={C.red} />,
                  text: "VK Bakes & Pizza House\nYour Locality, City — 000000",
                },
                {
                  icon: <Phone size={13} color={C.red} />,
                  text: "+91 99999 99999",
                },
                {
                  icon: <Clock size={13} color={C.red} />,
                  text: "Open 7 days a week",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 9, alignItems: "flex-start", marginBottom: 12 }}
                >
                  <div style={{
                    width:        24,
                    height:       24,
                    borderRadius: 6,
                    background:   "rgba(212,75,26,0.12)",
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    flexShrink:   0,
                    marginTop:    1,
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ fontFamily: C.f2, color: C.subtle, fontSize: 12, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {item.text}
                  </span>
                </div>
              ))}

            </div>

          </div>
        </div>

        {/* ── Delivery policy strip ────────────────────────── */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { e: "🚚", t: "Pizza, Bakes & Cakes — Home Delivery" },
              { e: "🍦", t: "Ice Cream — With Pizza/Cake/Bake only" },
              { e: "🏪", t: "Bread, Toast & Biscuits — Pickup only" },
              { e: "💵", t: "Cash on Delivery · ₹20 delivery fee" },
            ].map((p) => (
              <div key={p.t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>{p.e}</span>
                <span style={{ fontFamily: C.f2, color: C.subtle, fontSize: 11 }}>{p.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Copyright bar ────────────────────────────────── */}
        <div style={{
          borderTop:  `1px solid ${C.border}`,
          padding:    "14px 20px",
          background: C.footer,
        }}>
          <div style={{
            maxWidth:       900,
            margin:         "0 auto",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "space-between",
            flexWrap:       "wrap",
            gap:            8,
          }}>
            <span style={{ fontFamily: C.f2, color: C.subtle, fontSize: 11 }}>
              © {new Date().getFullYear()} VK Bakes & Pizza House. All rights reserved.
            </span>
            <span style={{ fontFamily: C.f2, color: C.subtle, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
              Made with <Heart size={11} fill={C.red} color={C.red} /> for our neighborhood
            </span>
          </div>
        </div>

      </footer>
    </>
  );
}