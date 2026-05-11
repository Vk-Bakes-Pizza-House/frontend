import { C } from "../../data/menu";
import { MapPin, Clock, Phone } from "lucide-react";  
import { WA } from "../../config";

function ContactPage() {
  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"32px 16px" }}>
      <div style={{ maxWidth:540, margin:"0 auto" }}>
        <h2 style={{ fontFamily:C.f1, color:C.mid, fontSize:28, fontWeight:700, marginBottom:20 }}>Find Us</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { icon:<MapPin size={18} color={C.red}/>, t:"Address",       b:"VK Bakes & Pizza House\nYour Locality, City — 000000" },
            { icon:<Clock  size={18} color={C.red}/>, t:"Store Timings", b:"Mon – Sat: 8:00 AM – 9:00 PM\nSunday: 9:00 AM – 8:00 PM" },
            { icon:<Phone  size={18} color={C.red}/>, t:"WhatsApp",      b:"+91 99999 99999" },
          ].map(({ icon, t, b }) => (
            <div key={t} style={{ background:"white", borderRadius:12, padding:"18px", border:`1px solid ${C.border}`, display:"flex", gap:14, alignItems:"flex-start" }}>
              <div style={{ width:38, height:38, borderRadius:9, background:"#FFF0E0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily:C.f2, fontWeight:700, color:C.mid, fontSize:14, marginBottom:3 }}>{t}</div>
                <div style={{ fontFamily:C.f2, color:C.muted, fontSize:13, whiteSpace:"pre-line" }}>{b}</div>
              </div>
            </div>
          ))}
          <a href={`https://wa.me/${WA}`} target="_blank" rel="noreferrer"
            style={{ background:C.green, color:"white", padding:"15px", borderRadius:12, fontFamily:C.f2, fontWeight:700, fontSize:15, textAlign:"center", display:"block", textDecoration:"none" }}>
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;