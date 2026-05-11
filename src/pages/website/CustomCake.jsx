import { useState } from "react";
import { C } from "../../data/menu";
import { WA } from "../../config";

function  CustomCake() {
  const [f, setF] = useState({ size:"1kg", flavour:"Chocolate", msg:"", design:"Simple", date:"", phone:"" });
  const set = (k, v) => setF(p => ({ ...p, [k]:v }));

  const BtnGroup = ({ opts, val, on }) => (
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {opts.map(o => (
        <button key={o} onClick={() => on(o)}
          style={{ padding:"7px 14px", borderRadius:8, fontFamily:C.f2, fontSize:13, fontWeight:500,
            background:val===o?C.red:"white", color:val===o?"white":C.mid, border:val===o?"none":`1px solid ${C.border}` }}>
          {o}
        </button>
      ))}
    </div>
  );

  const submit = () => {
    if (!f.phone || !f.date) { alert("Please fill your phone number and delivery date!"); return; }
    const m = `🎂 CUSTOM CAKE ORDER — VK Bakes\n\n📱 Phone: ${f.phone}\n🍰 Size: ${f.size}\n🍫 Flavour: ${f.flavour}\n✍️ Message: ${f.msg || "None"}\n🎨 Design: ${f.design}\n📅 Delivery Date: ${f.date}\n\n⚠️ Min 2 days advance. Price confirmed by us after receiving your order.`;
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(m)}`, "_blank");
  };

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"32px 16px" }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <div style={{ fontFamily:C.f2, color:C.muted, fontSize:11, letterSpacing:3, marginBottom:8 }}>MADE TO ORDER</div>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:6 }}>Custom Cake Order</h2>
        <p style={{ fontFamily:C.f2, color:C.muted, fontSize:13, marginBottom:24 }}>
          Order at least 2 days ahead. Price confirmed by us on WhatsApp after booking.
        </p>
        <div style={{ background:"white", borderRadius:16, padding:"24px", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", gap:20 }}>
          {[
            { l:"Cake Size",    comp:<BtnGroup opts={["500g","1kg","2kg"]}                              val={f.size}    on={v=>set("size",v)}    /> },
            { l:"Flavour",      comp:<BtnGroup opts={["Chocolate","Vanilla","Butterscotch","Strawberry","Pineapple"]} val={f.flavour} on={v=>set("flavour",v)} /> },
            { l:"Design Style", comp:<BtnGroup opts={["Simple","Designer","Photo Cake"]}                val={f.design}  on={v=>set("design",v)}  /> },
          ].map(({ l, comp }) => (
            <div key={l}>
              <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginBottom:8 }}>{l}</div>
              {comp}
            </div>
          ))}
          {[
            { l:"Message on Cake",  ph:'e.g. "Happy Birthday Raj! 🎉"', k:"msg",   type:"text" },
            { l:"Delivery Date ✱",  ph:"",                               k:"date",  type:"date" },
            { l:"Your Phone ✱",     ph:"9876543210",                     k:"phone", type:"tel"  },
          ].map(({ l, ph, k, type }) => (
            <div key={k}>
              <div style={{ fontFamily:C.f2, fontWeight:600, color:C.mid, fontSize:13, marginBottom:8 }}>{l}</div>
              <input type={type} value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph}
                style={{ width:"100%", padding:"10px 13px", border:`1px solid ${C.border}`, borderRadius:8, fontFamily:C.f2, fontSize:13, color:C.mid, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
          <button onClick={submit}
            style={{ background:C.green, color:"white", padding:"14px", borderRadius:10, fontFamily:C.f2, fontWeight:700, fontSize:15, width:"100%" }}>
            📱 Send Order on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomCake;