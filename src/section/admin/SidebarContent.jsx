import { useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { NAV } from "./Nav";
// import AdminProfile from "../../pages/admin/AdminProfile";


function AdminProfile({ onProfileClick }) {
  return (
    <div
      onClick={onProfileClick}
      className="flex items-center gap-3 p-3 mx-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all group"
    >
      <div className="w-9 h-9 rounded-full bg-[#D44B1A] flex items-center justify-center font-sans font-bold text-white text-sm shadow-md group-hover:scale-105 transition-transform">
        VK
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-sans font-bold text-sm text-[#FFF8F0] truncate">VK Admin</span>
        <span className="font-sans text-[11px] text-[#8B6A4F] truncate">Store Owner</span>
      </div>
    </div>
  );
}


export function SidebarContent({ page, onNavigate, onLogout, onProfileClick, setOpen }) {
  // Dropdown open/close state works perfectly now without resetting on clicks
  const [menuDropdownOpen, setMenuDropdownOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-[#1A0A00]">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="font-serif text-[#F5A623] text-xl font-bold tracking-wide">VK Bakes</div>
        <div className="font-sans text-[#D44B1A] text-[10px] font-extrabold tracking-[0.25em] mt-1">ADMIN PANEL</div>
      </div>

      {/* Primary Links Nav Block */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const Icon = item.icon;

          if (item.isDropdown) {
            return (
              <div key={item.key} className="space-y-1">
                {/* Parent Dropdown Button */}
                <button
                  type="button"
                  onClick={() => setMenuDropdownOpen(!menuDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all duration-150 text-left ${
                    menuDropdownOpen
                      ? "bg-white/10 text-[#FFF8F0]"
                      : "text-[#C8A882] hover:bg-white/5 hover:text-[#FFF8F0]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      menuDropdownOpen ? "rotate-180 text-[#F5A623]" : "text-[#C8A882]"
                    }`}
                  />
                </button>

                {/* Sub-menu Dropdown List Box Wrapper */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    menuDropdownOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden pl-4 border-l border-white/10 ml-6 space-y-1 mt-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = page === child.key;

                      return (
                        <button
                          type="button"
                          key={child.key}
                          onClick={() => {
                            onNavigate(child.key);
                            setOpen(false); // Mobile drawer collapses safely
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all duration-150 text-left ${
                            isChildActive
                              ? "bg-[#F5A623] text-[#1A0A00] font-bold shadow-xs shadow-[#F5A623]/10"
                              : "text-[#C8A882] hover:bg-white/5 hover:text-[#FFF8F0]"
                          }`}
                        >
                          <ChildIcon size={14} />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          }

          // Normal Single Buttons links
          const isActive = page === item.key;
          return (
            <button
              type="button"
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-sm font-semibold transition-all duration-150 text-left ${
                isActive
                  ? "bg-[#F5A623] text-[#1A0A00] shadow-md shadow-[#F5A623]/10"
                  : "text-[#C8A882] hover:bg-white/5 hover:text-[#FFF8F0]"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Details Window */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
        <AdminProfile onProfileClick={onProfileClick} />

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-sans text-sm font-medium text-[#8B6A4F] hover:text-red-400 hover:bg-red-500/10 transition-colors text-left"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
