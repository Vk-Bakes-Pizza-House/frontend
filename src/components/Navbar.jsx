import React, { useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import useCartStore from "../store/cartStore";

function Navbar({ page, go }) {
  const [isOpen, setIsOpen] = useState(false); // Controls mobile drawer visibility
  const cartQty = useCartStore((state) => state.items.reduce((sum, item) => sum + (item.qty || 0), 0));

  const links = [
    ["home", "Home"],
    ["menu", "Menu"],
    ["cake", "Custom Cake"],
    ["contact", "Contact"],
    ["how-to-order", "How to Order"],
    ["login", "Login"],
  ];

  const handleNavClick = (route) => {
    go(route);
    setIsOpen(false); // Close mobile drawer when an item is selected
  };

  return (
    <nav className="bg-[#FFF8F0]/95 backdrop-blur-md border-b border-[#E8D5C0] sticky top-0 z-40 w-full transition-all duration-200">
      <div className="max-w-[1000px] mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo Section */}
        <button onClick={() => handleNavClick("home")} className="text-left focus:outline-none group">
          <div className="font-serif text-[#1A0A00] group-hover:text-[#D44B1A] text-xl font-black leading-none transition-colors">
            VK Bakes
          </div>
          <div className="font-sans text-[#D44B1A] text-[9px] font-bold tracking-[0.25em] mt-0.5">
            & PIZZA HOUSE
          </div>
        </button>

        {/* Action Controls & Navigation Wrapper */}
        <div className="flex gap-4 md:gap-6 items-center">
          
          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden md:flex gap-6">
            {links.map(([k, l]) => (
              <button
                key={k}
                onClick={() => handleNavClick(k)}
                className={`font-sans text-sm pb-1 border-b-2 font-medium transition-all duration-200 ${
                  page === k
                    ? "text-[#D44B1A] border-[#D44B1A]"
                    : "text-[#8B6A4F] border-transparent hover:text-[#1A0A00] hover:border-[#E8D5C0]"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Shopping Cart Button */}
          <button
            onClick={() => handleNavClick("cart")}
            className="bg-[#D44B1A] rounded-xl w-10 h-10 flex items-center justify-center relative shrink-0 hover:bg-[#b53a10] hover:scale-105 active:scale-95 transition-all focus:outline-none shadow-sm shadow-[#D44B1A]/20"
          >
            <ShoppingCart size={18} className="text-white" />
            
            {/* Cart Quantity Badge */}
            {cartQty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#F5A623] text-[#1A0A00] rounded-full w-[18px] h-[18px] flex items-center justify-center font-sans font-bold text-[10px] ring-2 ring-[#FFF8F0]">
                {cartQty}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle Button (Hidden on Desktop) */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden p-1.5 rounded-lg text-[#1A0A00] hover:bg-[#E8D5C0]/30 transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Smooth drop down based on state) */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 max-h-0 bg-white ${isOpen ? "max-h-64 border-t border-[#E8D5C0]" : ""}`}>
        <div className="px-4 py-2 flex flex-col gap-1 bg-[#FFF8F0]/50">
          {links.map(([k, l]) => (
            <button
              key={k}
              onClick={() => handleNavClick(k)}
              className={`w-full text-left font-sans py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors ${
                page === k
                  ? "text-[#D44B1A] bg-[#D44B1A]/10"
                  : "text-[#8B6A4F] hover:text-[#1A0A00] hover:bg-[#E8D5C0]/20"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;