import { useEffect, useState } from "react";
import { C } from "../../data/menu";
import { MapPin, Clock, Phone, MessageCircle } from "lucide-react";  
import { useStoreStore } from "../../store";
import { FaInstagram, FaFacebook } from "react-icons/fa";



function ContactPage() {
  const { store, fetchStore } = useStoreStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStore().then(() => setLoading(false));
  }, []);

  const storeName = store?.storeName || "VK Bakes & Pizza House";
  const address = store?.address || "Your Locality, City — 000000";
  const phone1 = store?.phone1 || "919999999999";
  const phone2 = store?.phone2 || "";
  const openTime = store?.openTime || "08:00";
  const closeTime = store?.closeTime || "21:00";

  const formatTime = (time24) => {
    const [h, m] = time24.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const timingText = `${formatTime(openTime)} – ${formatTime(closeTime)}`;
  const phoneDisplay = phone2 ? `${phone1.slice(0, 2)}-${phone1.slice(2, 7)} ${phone1.slice(7)} 
   ${phone2.slice(0, 2)}-${phone2.slice(2, 7)} ${phone2.slice(7)}` : `+${phone1.slice(0, 2)} ${phone1.slice(2)}`;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "32px 16px" }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <h2 style={{ fontFamily: C.f1, color: C.mid, fontSize: 28, fontWeight: 700, marginBottom: 20 }}>Find Us</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: <MapPin size={18} color={C.red} />, t: "Address", b: address },
            { icon: <Clock size={18} color={C.red} />, t: "Store Timings (Daily)", b: timingText },
            { icon: <Phone size={18} color={C.red} />, t: "Call Us", b: phoneDisplay },
          ].map(({ icon, t, b }) => (
            <div key={t} style={{ background: "white", borderRadius: 12, padding: "18px", border: `1px solid ${C.border}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: "#FFF0E0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
              <div>
                <div style={{ fontFamily: C.f2, fontWeight: 700, color: C.mid, fontSize: 14, marginBottom: 3 }}>{t}</div>
                <div style={{ fontFamily: C.f2, color: C.muted, fontSize: 13, whiteSpace: "pre-line" }}>{b}</div>
              </div>
            </div>
          ))}
          <div>
                      <h3 className="text-sm font-bold tracking-[2px] mb-5 text-[#D44B1A] ">
                        FIND US
                      </h3>
          
                     
                        
                        <div className="flex gap-3 mx-5">
                        {[
                          {
                            icon: <FaInstagram size={36} className="text-pink-500" />,
                            href: "https://www.instagram.com/its_vivek_1503?utm_source=qr&igsh=aGNwcW1kOXRjeTc5",
                          },
                          {
                            icon: <FaFacebook size={36} className="text-sky-500" />,
                            href: "https://www.facebook.com/share/1HHiwdNmMr/",
                          },
                          {
                            icon: <MessageCircle size={36} className="text-green-600" />,
                            href: `https://wa.me/${phone1}`,
                          },
                        ].map((item, index) => (
                          <a
                            key={index}
                            href={item.href}
                            target="_blank"
                            rel="noreferrer"
                            className="w-9 h-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition"
                          >
                            {item.icon}
                          </a>
                        ))}
                      
                      </div>
                    </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;