import { useEffect, useState } from "react";
import { C } from "../../data/menu";
import { MapPin, Clock, Phone } from "lucide-react";  
import { useStoreStore } from "../../store";

function ContactPage() {
  const { store, fetchStore } = useStoreStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore().then(() => setLoading(false));
  }, []);

  const storeName = store?.storeName || "VK Bakes & Pizza House";
  const address = store?.address || "Your Locality, City — 000000";
  const whatsapp = store?.whatsapp || "919999999999";
  const timings = store?.timings || {
    monFri: { open: "08:00", close: "21:00" },
    
  };

  const formatTime = (time24) => {
    const [h, m] = time24.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const timingText = `Mon – Fri: ${formatTime(timings.monFri.open)} – ${formatTime(timings.monFri.close)}\nSat: ${formatTime(timings.saturday.open)} – ${formatTime(timings.saturday.close)}\nSun: ${formatTime(timings.sunday.open)} – ${formatTime(timings.sunday.close)}`;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Find Us</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: <MapPin size={18} color={C.red} />, t: "Address", b: address },
            { icon: <Clock size={18} color={C.red} />, t: "Store Timings", b: timingText },
            { icon: <Phone size={18} color={C.red} />, t: "WhatsApp", b: `+${whatsapp.slice(0, 2)} ${whatsapp.slice(2)}` },
          ].map(({ icon, t, b }) => (
            <div key={t} style={{ background: "white", borderRadius: 12, padding: "18px", border: `1px solid ${C.border}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FFF0E0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily: C.f2, fontWeight: 700, color: C.mid, fontSize: 14, marginBottom: 3 }}>{t}</div>
                <div style={{ fontFamily: C.f2, color: C.muted, fontSize: 13, whiteSpace: "pre-line" }}>{b}</div>
              </div>
            </div>
          ))}
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"
            style={{ background: "#25D366", color: "white", padding: "15px", borderRadius: 12, fontFamily: C.f2, fontWeight: 700, fontSize: 15, textAlign: "center", display: "block", textDecoration: "none" }}>
            💬 Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;