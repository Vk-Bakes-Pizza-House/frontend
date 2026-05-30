import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Truck,
  Settings,
  StoreIcon,
} from "lucide-react";



export const NAV = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    key: "menu",
    label: "Manage Menu",
    icon: UtensilsCrossed,
  },

  {
    key: "itemDetail",
    label: "Manage Menu Detail",
    icon: Settings,
  },

  {
    key: "store",
    label: "Manage Store",
    icon: StoreIcon,
  },

  {
    key: "orders",
    label: "Manage Orders",
    icon: ShoppingBag,
  },

  {
    key: "reviews",
    label: "Manage Reviews",
    icon: Star,
  },
];