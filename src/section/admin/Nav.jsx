import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Truck,
  Settings,
  StoreIcon,
  PlusCircle, 
  ListTree,    // Naya icon dropdown items ke liye
  FileText     // Naya icon dropdown items ke liye
} from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon:LayoutDashboard   },
  { 
    key: "manageMenu", 
    label: "Manage Menu", 
    icon: UtensilsCrossed,
    isDropdown: true,
    children: [
      { key: "addMenu", label: "Add Menu Category", icon: ListTree },
      { key: "addItem", label: "Add Menu Items", icon: PlusCircle },
      { key: "itemDetails", label: "Menu Item Details", icon: FileText },
      { key: "combos", label: "Manage Combos", icon: ListTree }
    ]
  },
  { key: "store", label: "Store Management", icon: StoreIcon },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "howToOrder", label: "How To Order", icon: Truck },
  { key: "profile", label: "Profile", icon: Settings },

];