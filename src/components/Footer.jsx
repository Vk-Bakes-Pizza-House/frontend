// Footer.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Star,
  ChevronRight,
  Heart,
} from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";
import { useStoreStore } from "../store";
import {C} from "../data/menu";

const WA_DEFAULT = "919999999999";

const NAV_LINKS = [
  { label: "Home", href: "/home" },
  { label: "Our Menu", href: "/menu" },
  { label: "Custom Cake", href: "/cake" },
  { label: "Daily Offers", href: "/home" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact Us", href: "/contact" },
];

const CATEGORIES = [
  { label: "🍕 Pizzas", href: "/menu" },
  { label: "🍦 IceCream", href: "/menu" },
  { label: "🍪 Cookies", href: "/menu" },
  { label: "🎂 Cakes", href: "/menu" },
  { label: "🧁 CupCakes", href: "/menu" },
  { label: "🍞 Bread & Toast", href: "/menu" },
  { label: "🥐 Buns", href: "/menu" },
];

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-all"
        >
          <Star
            size={20}
            className={`${(hover || value) >= n
                ? "fill-yellow-400 text-yellow-400"
                : "text-stone-600"
              }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Footer({ onNavigate }) {
  const { store, fetchStore } = useStoreStore();
  const [storeData, setStoreData] = useState(null);

  useEffect(() => {
    fetchStore().then((data) => {
      if (data) setStoreData(data);
    });
  }, [fetchStore]);

  const navigate = (href) => {
    if (onNavigate) onNavigate(href.replace("/", ""));
    else window.location.hash = href;
  };

  // Use store data or fallback
  const storeName = storeData?.storeName || "VK Bakes";
  const storeAddress = storeData?.address || "Your Locality, City — 000000";
  const deliveryFee = storeData?.deliveryFee || 20;
  const phone1 = storeData?.phone1 || WA_DEFAULT;
  const phone2 = storeData?.phone2 || "";
  const openTime = storeData?.openTime || "08:00";
  const closeTime = storeData?.closeTime || "21:00";
  const deliveryZone = storeData?.deliveryZone || "Within 5 km";

  const formatTime = (time24) => {
    const [h, m] = time24.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  };

  const phoneDisplay = phone2
    ? `+${phone1.slice(0, 2)} ${phone1.slice(2)} 
     +${phone2.slice(0, 2)} ${phone2.slice(2)}`
    : `+${phone1.slice(0, 2)} ${phone1.slice(2)}`;

  return (
    <footer className="bg-[#120600] text-[#E8D5C0] font-sans">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Brand */}
          <div>
            <div className="mb-3 ">
              <h2 className="text-xl font-bold text-[#F5A623]">Vk Bakes &</h2>
              <p className="text-xl font-bold text-[#D44B1A] mt-0.5">PIZZA HOUSE</p>
            </div>
           
            <p className="text-xs leading-6 text-[#eab869] mb-4">
              Fresh-baked breads, artisan cakes, and hot pizzas — made with love.
            </p>

            {/* Social */}

          </div>

          {/* Quick Links */}
          <div >
            <h3 className="text-sm font-bold tracking-[2px] mb-5 text-[#D44B1A] ">
              QUICK LINKS
            </h3>

            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href === "/home" ? "/" : link.href}
                    className="flex items-center gap-2 text-xs  text-[#eab869] hover:text-[#eba205] transition"
                  >
                    <ChevronRight size={14} className="text-[#D44B1A]" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-bold tracking-[2px] mb-3 text-[#D44B1A]">
              OUR MENU
            </h3>

            <ul className="space-y-2">
              {CATEGORIES.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-xs text-[#eab869] hover:text-[#eba205] transition"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold tracking-[2px] mb-5 text-[#D44B1A] ">
              FIND US
            </h3>

            <div className="space-y-4">
              {[
                {
                  icon: <MapPin size={14} className="text-[#D44B1A]" />,
                  text: `${storeName}\n${storeAddress}`,
                },
                {
                  icon: <Phone size={14} className="text-[#D44B1A]" />,
                  text: phoneDisplay,
                },
                {
                  icon: <Clock size={14} className="text-[#D44B1A]" />,
                  text: `${formatTime(openTime)} – ${formatTime(closeTime)}, 7 days`,
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-7 h-7 rounded-md bg-[#D44B1A]/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>

                  <p className="text-xs leading-5 whitespace-pre-line text-[#eab869]">
                    {item.text}
                  </p>
                </div>
              ))}
              <div className="flex gap-3">
                {[
                  {
                    icon: <FaInstagram size={16} className="text-pink-500" />,
                    href: "https://www.instagram.com/its_vivek_1503?utm_source=qr&igsh=aGNwcW1kOXRjeTc5",
                  },
                  {
                    icon: <FaFacebook size={16} className="text-sky-500" />,
                    href: "https://www.facebook.com/share/1HHiwdNmMr/",
                  },
                  {
                    icon: <MessageCircle size={16} className="text-green-600" />,
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

              {/* Badge */}

              <div className="inline-flex items-center gap-2 mt-5 px-3 py-1 rounded-full border border-green-500/20 bg-green-500/10">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-semibold text-green-500">
                  {`${deliveryZone}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Strip */}
      {/* <div className="border-t border-white/10 px-5 py-4">
<div className="max-w-7xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 text-xs text-[#eab869]">          {[
            "🚚 Pizza, Bakes & Cakes — Home Delivery",
            "🍦 Ice Cream — With Pizza/Cake/Bake only",
            "🏪 Bread, Toast & Biscuits — Pickup only",
            `💵 Cash on Delivery · ₹${deliveryFee} delivery fee`,
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* Copyright */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm  text-[#D44B1A]  ">
          <span>
            © {new Date().getFullYear()} VK Bakes & Pizza House. All rights
            reserved.
          </span>

          <span className="flex items-center gap-1">
            Made with
            <Heart size={12} className="fill-[#D44B1A] text-[#D44B1A]" />
            for our neighborhood
          </span>
        </div>
      </div>
    </footer>
  );
}