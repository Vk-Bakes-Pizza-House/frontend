import { useState, useRef, useEffect } from "react";
import {
  User, Lock, Store, Bell, AlertTriangle, Eye, EyeOff,
  Check, Camera, Phone, MapPin, Clock, Save, LogOut,
  Shield, ToggleLeft, ToggleRight, Edit3, Copy,
  CheckCircle, X, Trash2, RefreshCw, Smartphone,
  ChevronRight, Activity, Key, Globe, Volume2, Mail,
} from "lucide-react";
 import { useProfileStore } from "../../store";
import { Input,SaveButton,Alert,ToggleRow,StrengthMeter,PasswordInput } from "../../components/From";
 export default function ProfileTab() {
   const [form, setForm]       = useState({ displayName: "VK Admin", username: "vkadmin", email: "", bio: "" });
   const [avatar, setAvatar]   = useState(null);
   const [loading, setLoading] = useState(false);
   const [saved,   setSaved]   = useState(false);
   const [copied,  setCopied]  = useState(false);
   const fileRef = useRef();
 
   const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };
 
   const handleAvatar = e => {
     const f = e.target.files?.[0];
     if (!f) return;
     const r = new FileReader();
     r.onload = () => setAvatar(r.result);
     r.readAsDataURL(f);
   };
 
   const save = async () => {
     setLoading(true);
     await new Promise(r => setTimeout(r, 900));
     setLoading(false); setSaved(true);
     setTimeout(() => setSaved(false), 3000);
   };
 
   const copyUsername = () => {
     navigator.clipboard?.writeText(form.username);
     setCopied(true);
     setTimeout(() => setCopied(false), 1500);
   };
 
   return (
     <div className="space-y-5">
 
       {/* Avatar card */}
       <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
         <p className="text-sm font-bold text-stone-200 mb-4">Profile Photo</p>
         <div className="flex items-center gap-5">
           {/* Avatar */}
           <div className="relative flex-shrink-0">
             <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center ring-2 ring-orange-500/40">
               {avatar
                 ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                 : <span className="text-3xl font-black text-white select-none">VK</span>}
             </div>
             <button
               onClick={() => fileRef.current?.click()}
               className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-500 flex items-center justify-center shadow-lg transition-colors"
             >
               <Camera size={12} className="text-white" />
             </button>
             <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
           </div>
           <div>
             <p className="text-sm font-semibold text-stone-200 mb-1">{form.displayName}</p>
             <p className="text-xs text-stone-500 mb-3">@{form.username} · Admin</p>
             <button
               onClick={() => fileRef.current?.click()}
               className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1.5 transition-colors"
             >
               <Edit3 size={11} /> Change photo
             </button>
           </div>
         </div>
       </div>
 
       {/* Personal info */}
       <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
         <p className="text-sm font-bold text-stone-200 mb-5">Personal Information</p>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <Input
             label="Display Name"
             value={form.displayName}
             onChange={e => set("displayName", e.target.value)}
             placeholder="VK Admin"
             icon={User}
           />
           <div className="flex flex-col gap-1.5">
             <label className="text-xs font-semibold text-stone-400 tracking-wider uppercase">Username</label>
             <div className="relative">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 text-xs font-mono">@</span>
               <input
                 value={form.username}
                 readOnly
                 className="w-full pl-7 pr-9 py-2.5 rounded-lg border border-stone-700 bg-stone-800/50 text-stone-500 text-sm cursor-default outline-none"
               />
               <button onClick={copyUsername} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-orange-400 transition-colors">
                 {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
               </button>
             </div>
             <p className="text-xs text-stone-600">Username cannot be changed</p>
           </div>
           <div className="sm:col-span-2">
             <Input
               label="Email (optional)"
               type="email"
               value={form.email}
               onChange={e => set("email", e.target.value)}
               placeholder="you@example.com"
               icon={Mail}
               hint="Used for password recovery notifications"
             />
           </div>
           <div className="sm:col-span-2 flex flex-col gap-1.5">
             <label className="text-xs font-semibold text-stone-400 tracking-wider uppercase">Short Bio</label>
             <textarea
               value={form.bio}
               onChange={e => set("bio", e.target.value)}
               placeholder="Owner & Baker at VK Bakes…"
               rows={3}
               className="w-full px-3 py-2.5 rounded-lg border border-stone-600 bg-stone-800 text-stone-100 text-sm resize-none outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all"
             />
           </div>
         </div>
       </div>
 
       {/* Account info (read-only) */}
       <div className="bg-stone-800/50 rounded-2xl border border-stone-700/50 p-6">
         <p className="text-sm font-bold text-stone-200 mb-5">Account Information</p>
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {[
             { label: "Role",        value: "Super Admin", icon: Shield   },
             { label: "Last Login",  value: "Today, 9:41 AM", icon: Activity },
             { label: "Member Since",value: "Jan 2025",    icon: Clock    },
           ].map(item => (
             <div key={item.label} className="bg-stone-900/50 rounded-xl p-4 flex items-start gap-3">
               <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                 <item.icon size={14} className="text-orange-400" />
               </div>
               <div>
                 <p className="text-xs text-stone-500 mb-0.5">{item.label}</p>
                 <p className="text-sm font-semibold text-stone-200">{item.value}</p>
               </div>
             </div>
           ))}
         </div>
       </div>
 
       <div className="flex justify-end">
         <SaveButton onClick={save} loading={loading} saved={saved} />
       </div>
     </div>
   );
 }