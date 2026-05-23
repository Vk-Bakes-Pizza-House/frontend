import { useState } from "react";
import WhatsAppButton from "../../components/WhatsAppButton";
import { C } from "../../data/menu";
import { WA } from "../../config";

// ── Min delivery date = today + 2 days ───────────────────────
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
};

// ── BtnGroup — defined OUTSIDE component (stable reference) ──
function BtnGroup({ opts, val, on }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => on(o)}
          style={{
            padding:      "7px 14px",
            borderRadius: 8,
            fontFamily:   C.f2,
            fontSize:     13,
            fontWeight:   500,
            background:   val === o ? C.red   : "white",
            color:        val === o ? "white" : C.mid,
            border:       val === o ? "none"  : `1px solid ${C.border}`,
            cursor:       "pointer",
            transition:   "all 0.15s",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ── Field label wrapper ───────────────────────────────────────
function FieldLabel({ label }) {
  return (
    <div style={{ fontFamily: C.f2, fontWeight: 600, color: C.mid, fontSize: 13, marginBottom: 8 }}>
      {label}
    </div>
  );
}

// ── Input style ───────────────────────────────────────────────
const inputStyle = (C) => ({
  width:        "100%",
  padding:      "10px 13px",
  border:       `1px solid ${C.border}`,
  borderRadius: 8,
  fontFamily:   C.f2,
  fontSize:     13,
  color:        C.mid,
  outline:      "none",
  boxSizing:    "border-box",
  background:   "white",
});

// ═══════════════════════════════════════════════════════════════
function CustomCake() {
  const [f, setF] = useState({
    size:     "1lb",
    flavour:  "Simple Bread",
    msg:      "",
    design:   "Simple", // Controls both form submission and image preview state
    date:     "",
    phone:    "",
    location: "",
  });

  // Admin panel placeholder images (These will come from your item data model once connected)
  const cakePreviews = {
    "Simple": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    "Designer": "https://images.unsplash.com/photo-1535141192574-5d4897c13636?w=600&auto=format&fit=crop&q=80",
    "Photo Cake": "https://images.unsplash.com/photo-1464349172961-10442b37710e?w=600&auto=format&fit=crop&q=80"
  };

  // Single setter — keeps form state clean
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  // Button groups config
  const SELECTORS = [
    {
      l:    "Cake Size",
      opts: ["1lb", "1.5lb", "2lb"],
      k:    "size",
    },
    {
      l:    "Flavour",
      opts: ["Simple Bread","Chocolate", "Vanilla", "Butterscotch", "Strawberry", "Pineapple"],
      k:    "flavour",
    },
    {
      l:    "Design Style",
      opts: ["Simple", "Designer", "Photo Cake"],
      k:    "design",
    },
  ];

  // Text / date / tel inputs config
  const INPUTS = [
    { l: 'Message on Cake',  ph: '"Happy Birthday Raj! 🎉"', k: "msg",   type: "text" },
    { l: "Delivery Date ✱",  ph: "",                         k: "date",  type: "date", min: getMinDate() },
    { l: "Your Phone ✱",     ph: "9876543210",               k: "phone", type: "tel"  },
    { l: "Your Location ✱",  ph: "Enter your location",      k: "location", type: "text"  },
  ];

  // Disable the button until required fields are filled
  const isDisabled = !f.phone.trim() || !f.date;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>

        {/* Heading */}
        <div style={{ fontFamily: C.f2, color: C.muted, fontSize: 11, letterSpacing: 3, marginBottom: 8 }}>
          MADE TO ORDER
        </div>
        <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
          Custom Cake Order
        </h2>
        <p style={{ fontFamily: C.f2, color: C.muted, fontSize: 13, marginBottom: 24 }}>
          Order at least 2 days ahead. Price confirmed by us on WhatsApp after booking.
        </p>

        {/* Form card */}
        <div style={{
          background:    "white",
          borderRadius:  16,
          padding:       "24px",
          border:        `1px solid ${C.border}`,
          display:       "flex",
          flexDirection: "column",
          gap:           20,
        }}>

          {/* ── NEW IMAGE SECTION ───────────────────────────────────── */}
          <div>
            <FieldLabel label="Design Preview Reference" />
            <div style={{
              position: "relative",
              width: "100%",
              height: "240px",
              borderRadius: "12px",
              overflow: "hidden",
              border: `1px solid ${C.border}`,
              background: "#FFF8F0",
              marginBottom: "4px"
            }}>
              {/* Main Preview Image */}
              <img 
                src={cakePreviews[f.design]} 
                alt={`${f.design} Cake Style`} 
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "all 0.3s ease-in-out"
                }}
              />

              {/* Interactive Style Selector Pill Overlays */}
              <div style={{
                position: "absolute",
                bottom: "12px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.65)",
                backdropFilter: "blur(4px)",
                padding: "4px",
                borderRadius: "20px",
                display: "flex",
                gap: "4px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                {Object.keys(cakePreviews).map((styleName) => {
                  const isActive = f.design === styleName;
                  return (
                    <button
                      key={styleName}
                      type="button"
                      onClick={() => set("design", styleName)}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "16px",
                        border: "none",
                        fontFamily: C.f2,
                        fontSize: "11px",
                        fontWeight: "600",
                        cursor: "pointer",
                        background: isActive ? "white" : "transparent",
                        color: isActive ? "#2D1400" : "rgba(255,255,255,0.85)",
                        transition: "all 0.2s"
                      }}
                    >
                      {styleName}
                    </button>
                  );
                })}
              </div>

              {/* Adaptive Dynamic Style Banner Tag */}
              <div style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                background: C.red,
                color: "white",
                padding: "4px 10px",
                borderRadius: "6px",
                fontFamily: C.f2,
                fontSize: "11px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {f.design} Option
              </div>
            </div>
            {f.design === "Photo Cake" && (
              <div style={{ fontFamily: C.f2, fontSize: 11, color: C.muted, mt: 4, paddingLeft: 2 }}>
                💡 <em>You can share your reference photo directly with us over WhatsApp after checkout!</em>
              </div>
            )}
          </div>
          {/* ────────────────────────────────────────────────────────── */}

          {/* Button-group selectors */}
          {SELECTORS.map(({ l, opts, k }) => (
            <div key={k}>
              <FieldLabel label={l} />
              <BtnGroup opts={opts} val={f[k]} on={(v) => set(k, v)} />
            </div>
          ))}

          {/* Text / date / tel inputs */}
          {INPUTS.map(({ l, ph, k, type, min }) => (
            <div key={k}>
              <FieldLabel label={l} />
              <input
                type={type}
                value={f[k]}
                min={min}                           // enforces 2-day advance on date picker
                onChange={(e) => set(k, e.target.value)}
                placeholder={ph}
                style={inputStyle(C)}
              />
              {/* Inline hint for date field */}
              {k === "date" && (
                <div style={{ fontFamily: C.f2, fontSize: 11, color: C.muted, marginTop: 5 }}>
                  📅 Earliest available: {getMinDate()}
                </div>
              )}
              {k === "phone" && (
                <div style={{ fontFamily: C.f2, fontSize: 11, color: C.muted, marginTop: 5 }}>
                  We'll confirm price and details on this number via WhatsApp.
                </div>
              )}
            </div>
          ))}

          {/* Disabled-state hint */}
          {isDisabled && (
            <div style={{
              background:   "#FFF3E0",
              border:       `1px solid #F5A623`,
              borderRadius: 8,
              padding:      "9px 12px",
              fontFamily:   C.f2,
              fontSize:     12,
              color:        "#8B5E00",
            }}>
              ⚠️ Please fill in your <strong>phone number</strong> and <strong>delivery date</strong> to place your order.
            </div>
          )}

          {/* ── WhatsApp Button ── */}
          <WhatsAppButton
            variant="cake"
            cakeForm={f}
            disabled={isDisabled}
          />

        </div>

        {/* Trust badges */}
        <div style={{
          display:        "flex",
          justifyContent: "center",
          gap:            20,
          marginTop:      20,
          flexWrap:       "wrap",
        }}>
          {[
            "🎂 100% Fresh",
            "⏰ 2 Days Advance",
            "💵 Pay on Delivery",
          ].map((b) => (
            <span key={b} style={{ fontFamily: C.f2, fontSize: 12, color: C.muted }}>
              {b}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
}

export default CustomCake;