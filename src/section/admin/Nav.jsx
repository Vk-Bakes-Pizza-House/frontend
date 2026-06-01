import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Truck,
  Settings,
  StoreIcon,
  PlusCircle, // Naya icon dropdown items ke liye
  ListTree,    // Naya icon dropdown items ke liye
  FileText     // Naya icon dropdown items ke liye
} from "lucide-react";

export const NAV = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard"
  },

  // Dropdown Group for Menu Management
  {
    key: "manage-menu-group",
    label: "Manage Menu",
    icon: UtensilsCrossed,
    isDropdown: true, // Flag identifying this has sub-items
    children: [
      {
        key: "addMenu",
        label: "Add Category/Menu",
        icon: ListTree,
        path: "/admin/add-menu"
      },
      {
        key: "addItem",
        label: "Add Menu Item",
        icon: PlusCircle,
        path: "/admin/add-item"
      },
      {
        key: "itemDetails",
        label: "Add Item Details",
        icon: FileText,
        path: "/admin/add-item-details"
      }
    ]
  },

  {
    key: "store",
    label: "Manage Store",
    icon: StoreIcon,
    path: "/admin/store"
  },

  {
    key: "orders",
    label: "Manage Orders",
    icon: ShoppingBag,
    path: "/admin/orders"
  },

  {
    key: "reviews",
    label: "Manage Reviews",
    icon: Star,
    path: "/admin/reviews"
  },

  {
    key: "howToOrder",
    label: "Manage How To Order",
    icon: Truck,
    path: "/admin/how-to-order"
  }
];