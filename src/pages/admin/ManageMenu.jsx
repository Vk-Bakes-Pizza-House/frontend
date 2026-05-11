// admin/ManageMenu.jsx
// ─────────────────────────────────────────────────────────────
// Full CRUD for menu items.
// • Add / Edit / Delete items
// • Toggle availability (in-stock / out-of-stock)
// • Filter by category
// In production: replace mock state with API calls to
// GET/POST/PUT/DELETE /api/menu  (your Express backend)
// ─────────────────────────────────────────────────────────────
import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { C } from "./Dashboard";

// ── initial mock data ────────────────────────────────────────
const INIT_ITEMS = [
  { id:1,  name:"Margherita Pizza",    cat:"pizza",   price:199, desc:"Classic tomato & mozzarella",     dlv:true,   available:true,  tag:"Bestseller" },
  { id:2,  name:"Veg Supreme Pizza",   cat:"pizza",   price:249, desc:"Capsicum, onion, mushroom",       dlv:true,   available:true,  tag:""           },
  { id:3,  name:"Paneer Tikka Pizza",  cat:"pizza",   price:279, desc:"Spicy paneer & bell peppers",     dlv:true,   available:true,  tag:"🌶️ Spicy"  },
  { id:4,  name:"Veg Cheese Bake",     cat:"bake",    price:89,  desc:"Golden pastry, cheese fill",      dlv:true,   available:true,  tag:"Bestseller" },
  { id:5,  name:"Corn & Spinach Bake", cat:"bake",    price:79,  desc:"Fresh corn & spinach",            dlv:true,   available:true,  tag:""           },
  { id:6,  name:"White Bread Loaf",    cat:"bread",   price:40,  desc:"Fresh baked daily",               dlv:false,  available:true,  tag:""           },
  { id:7,  name:"Brown Bread Loaf",    cat:"bread",   price:50,  desc:"Whole wheat goodness",            dlv:false,  available:true,  tag:""           },
  { id:8,  name:"Garlic Toast",        cat:"toast",   price:35,  desc:"Buttery garlic spread",           dlv:false,  available:false, tag:""           },
  { id:9,  name:"Butter Biscuits",     cat:"biscuit", price:30,  desc:"Crispy & buttery",                dlv:false,  available:true,  tag:""           },
  { id:10, name:"Choco Chip Cookies",  cat:"biscuit", price:45,  desc:"Rich chocolate chips",            dlv:false,  available:true,  tag:""           },
  { id:11, name:"Chocolate Truffle",   cat:"cake",    price:350, desc:"500g rich chocolate cake",        dlv:true,   available:true,  tag:""           },
  { id:12, name:"Butterscotch Cake",   cat:"cake",    price:320, desc:"500g caramel delight",            dlv:true,   available:true,  tag:""           },
  { id:13, name:"Mango Ice Cream",     cat:"ice",     price:60,  desc:"Alphonso mango flavour",          dlv:"cond", available:true,  tag:""           },
  { id:14, name:"Chocolate Ice Cream", cat:"ice",     price:60,  desc:"Dark chocolate scoop",            dlv:"cond", available:true,  tag:""           },
  { id:15, name:"Vanilla Ice Cream",   cat:"ice",     price:50,  desc:"Classic vanilla bean",            dlv:"cond", available:true,  tag:""           },
];

const CATS  = ["all","pizza","bake","bread","toast","biscuit","cake","ice"];
const EMOJI = { pizza:"🍕", bake:"🥐", bread:"🍞", toast:"🥖", biscuit:"🍪", cake:"🎂", ice:"🍦" };
const BLANK = { name:"", cat:"pizza", price:"", desc:"", dlv:true, tag:"", available:true };

// ── Input field ──────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:12, letterSpacing:0.5 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inp = {
  width:"100%", padding:"9px 12px",
  border:`1px solid ${C.border}`, borderRadius:8,
  fontFamily:C.f2, fontSize:13, color:C.mid,
  background:"white",
};

// ── Item form (add / edit) ────────────────────────────────────
function ItemForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));
  const valid = f.name.trim() && f.price && Number(f.price) > 0;

  return (
    <div style={{
      background:   "white",
      border:       `1px solid ${C.border}`,
      borderRadius: 14,
      padding:      "22px",
      marginBottom: 18,
    }}>
      <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:16, marginBottom:16 }}>
        {initial.id ? "Edit Item" : "Add New Item"}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <Field label="Item Name *">
            <input style={inp} value={f.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Farmhouse Pizza" />
          </Field>
        </div>
        <Field label="Category *">
          <select style={inp} value={f.cat} onChange={e => set("cat", e.target.value)}>
            {CATS.filter(c => c !== "all").map(c => (
              <option key={c} value={c}>{EMOJI[c]} {c.charAt(0).toUpperCase()+c.slice(1)}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (₹) *">
          <input style={inp} type="number" min="0" value={f.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 199" />
        </Field>
        <div style={{ gridColumn:"1/-1" }}>
          <Field label="Description">
            <input style={inp} value={f.desc} onChange={e => set("desc", e.target.value)} placeholder="Short item description" />
          </Field>
        </div>
        <Field label="Tag (optional)">
          <input style={inp} value={f.tag} onChange={e => set("tag", e.target.value)} placeholder='e.g. "Bestseller" or "🌶️ Spicy"' />
        </Field>
        <Field label="Delivery Rule">
          <select style={inp} value={String(f.dlv)} onChange={e => {
            const v = e.target.value;
            set("dlv", v === "true" ? true : v === "false" ? false : "cond");
          }}>
            <option value="true">🚚 Always deliverable</option>
            <option value="cond">🍕 Only with Pizza/Cake/Bake</option>
            <option value="false">🏪 Store pickup only</option>
          </select>
        </Field>
      </div>

      <div style={{ display:"flex", gap:10, marginTop:18, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{
          padding:"9px 18px", border:`1px solid ${C.border}`, borderRadius:8,
          fontFamily:C.f2, fontSize:13, fontWeight:600, color:C.muted,
        }}>
          Cancel
        </button>
        <button onClick={() => valid && onSave(f)} style={{
          padding:"9px 18px", background:valid ? C.red : "#E0C0B0", borderRadius:8,
          fontFamily:C.f2, fontSize:13, fontWeight:700, color:"white",
          cursor: valid ? "pointer" : "not-allowed",
        }}>
          <Check size={13} style={{ display:"inline", marginRight:5 }} />
          {initial.id ? "Update Item" : "Add Item"}
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function ManageMenu() {
  const [items,   setItems]   = useState(INIT_ITEMS);
  const [cat,     setCat]     = useState("all");
  const [q,       setQ]       = useState("");
  const [adding,  setAdding]  = useState(false);
  const [editing, setEditing] = useState(null); // item being edited

  // filter
  const visible = items.filter(i =>
    (cat === "all" || i.cat === cat) &&
    i.name.toLowerCase().includes(q.toLowerCase())
  );

  // handlers
  const addItem = (f) => {
    setItems(prev => [...prev, { ...f, id: Date.now(), price: Number(f.price) }]);
    setAdding(false);
  };
  const updateItem = (f) => {
    setItems(prev => prev.map(i => i.id === f.id ? { ...f, price: Number(f.price) } : i));
    setEditing(null);
  };
  const deleteItem = (id) => {
    if (window.confirm("Delete this item from the menu?")) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };
  const toggleAvail = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, available: !i.available } : i));
  };

  const dlvLabel = (d) =>
    d === true  ? { t:"Delivers",    s:{ bg:"#DCFCE7", color:"#166534" } } :
    d === "cond"? { t:"Cond.",       s:{ bg:"#FEF9C3", color:"#854D0E" } } :
                  { t:"Pickup only", s:{ bg:"#F3F4F6", color:"#6B7280" } };

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:24, fontWeight:700 }}>Manage Menu</h2>
          <p style={{ fontFamily:C.f2, color:C.muted, fontSize:13, marginTop:3 }}>
            {items.length} items · {items.filter(i=>!i.available).length} out of stock
          </p>
        </div>
        {!adding && !editing && (
          <button onClick={() => setAdding(true)} style={{
            display:"flex", alignItems:"center", gap:7,
            padding:"10px 18px", background:C.red, borderRadius:9,
            fontFamily:C.f2, fontWeight:700, fontSize:13, color:"white",
          }}>
            <Plus size={15} /> Add Item
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <ItemForm initial={BLANK} onSave={addItem} onCancel={() => setAdding(false)} />
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"white",
          border:`1px solid ${C.border}`, borderRadius:8, padding:"0 12px", flex:"1 1 180px" }}>
          <Search size={14} color={C.muted} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search items…"
            style={{ border:"none", outline:"none", fontFamily:C.f2, fontSize:13, color:C.mid, padding:"9px 0", flex:1 }} />
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding:"7px 13px", borderRadius:20,
              fontFamily:C.f2, fontSize:12, fontWeight:500,
              background:cat===c?C.red:"white", color:cat===c?"white":C.mid,
              border:cat===c?"none":`1px solid ${C.border}`,
            }}>
              {c==="all" ? "All" : `${EMOJI[c]} ${c.charAt(0).toUpperCase()+c.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background:"white", border:`1px solid ${C.border}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#FFF8F4" }}>
                {["Item","Category","Price","Tag","Delivery","Stock","Actions"].map(h => (
                  <th key={h} style={{
                    padding:"10px 14px", fontFamily:C.f2, fontSize:11,
                    fontWeight:700, color:C.muted, letterSpacing:1, textAlign:"left", whiteSpace:"nowrap",
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((item, idx) => {
                const dl = dlvLabel(item.dlv);
                if (editing?.id === item.id) {
                  return (
                    <tr key={item.id}>
                      <td colSpan={7} style={{ padding:"16px 14px", borderTop:`1px solid ${C.border}` }}>
                        <ItemForm initial={editing} onSave={updateItem} onCancel={() => setEditing(null)} />
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={item.id} style={{ borderTop:`1px solid ${C.border}`, background:idx%2?"white":"#FEFAF7", opacity:item.available?1:0.55 }}>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13 }}>{item.name}</div>
                      <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, marginTop:2 }}>{item.desc}</div>
                    </td>
                    <td style={{ padding:"12px 14px", whiteSpace:"nowrap" }}>
                      <span style={{ fontFamily:C.f2, fontSize:13 }}>{EMOJI[item.cat]} {item.cat}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontFamily:C.f2, fontWeight:700, color:C.red, fontSize:14 }}>₹{item.price}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontFamily:C.f2, fontSize:12, color:C.muted }}>{item.tag || "—"}</span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ ...dl.s, padding:"3px 9px", borderRadius:20, fontSize:11, fontFamily:C.f2, fontWeight:600 }}>
                        {dl.t}
                      </span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <button onClick={() => toggleAvail(item.id)} style={{ display:"flex", alignItems:"center", gap:5 }}>
                        {item.available
                          ? <ToggleRight size={24} color={C.green} />
                          : <ToggleLeft  size={24} color={C.muted} />}
                        <span style={{ fontFamily:C.f2, fontSize:11, color:item.available?C.green:C.muted, fontWeight:600 }}>
                          {item.available ? "In Stock" : "Sold Out"}
                        </span>
                      </button>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={() => setEditing(item)} style={{
                          padding:"6px 10px", borderRadius:6, border:`1px solid ${C.border}`,
                          display:"flex", alignItems:"center", gap:4,
                          fontFamily:C.f2, fontSize:11, fontWeight:600, color:C.mid,
                        }}>
                          <Pencil size={12} /> Edit
                        </button>
                        <button onClick={() => deleteItem(item.id)} style={{
                          padding:"6px 10px", borderRadius:6, border:"1px solid #FEE2E2",
                          display:"flex", alignItems:"center", gap:4,
                          fontFamily:C.f2, fontSize:11, fontWeight:600, color:"#991B1B",
                          background:"#FFF5F5",
                        }}>
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding:"40px", textAlign:"center", fontFamily:C.f2, color:C.muted, fontSize:14 }}>
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}