import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu as MenuIcon, X } from "lucide-react";
import { NAV } from "./Nav";
import {SidebarContent} from "./SidebarContent";

export function AdminShell({ page, onNavigate, onLogout, onProfileClick }) {
  const [open, setOpen] = useState(false);

  // Dynamic header resolution helper routine
  const activeNavLabel = () => {
    for (const link of NAV) {
      if (link.key === page) return link.label;
      if (link.children) {
        const matchingChild = link.children.find(c => c.key === page);
        if (matchingChild) return matchingChild.label;
      }
    }
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen font-sans bg-[#FFF8F0] antialiased">

      {/* Sidebar Layout Variant — Desktop Explicit Execution Wrapper */}
      <aside className="hidden md:block w-60 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-[#E8D5C0]">
        <SidebarContent 
          page={page} 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          onProfileClick={onProfileClick} 
          setOpen={setOpen} 
        />
      </aside>

      {/* Mobile Drawer Backdrop overlay mask */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Layout Variant — Mobile Drawer Slide Panel */}
      <aside className={`fixed top-0 bottom-0 left-0 w-60 z-50 md:hidden bg-[#1A0A00] transition-transform duration-300 ease-in-out flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 text-[#8B6A4F] hover:text-white p-1 rounded-lg z-10"
        >
          <X size={18} />
        </button>
        <SidebarContent 
          page={page} 
          onNavigate={onNavigate} 
          onLogout={onLogout} 
          onProfileClick={onProfileClick} 
          setOpen={setOpen} 
        />
      </aside>

      {/* Primary Inner Application Sub-canvas Canvas context display window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Layout Anchor Header */}
        <header className="bg-white border-b border-[#E8D5C0] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="md:hidden p-1.5 -ml-1 rounded-lg text-[#2D1400] hover:bg-gray-100 transition-colors"
            >
              <MenuIcon size={20} />
            </button>
            <h1 className="font-sans font-bold text-[#2D1400] text-base">
              {activeNavLabel()}
            </h1>
          </div>
        </header>

        {/* Dynamic Outlet Injection Node Context Canvas view container */}
        <main className="flex-1 p-6 max-w-[1200px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}