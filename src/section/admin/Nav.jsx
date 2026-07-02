import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Star,
  Truck,
  Settings,
  StoreIcon,
  PlusCircle, 
  ListTree,    
  FileText,    
  Globe,
  Warehouse,
  DollarSign ,
  TrendingUp,
  ChartColumnIncreasing,
  ClipboardList,
  Receipt,
  FileCheck,
 ClipboardCheck,
 Undo2,
 HandCoins,
 Handshake,
 Package
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
  {
    key: "inventory",
    label:"Inventory",
    icon: Warehouse,
    isDropdown: true,
    children: [
        { key: "products", label: "Prodcuts", icon: Package },
        { key: "Stock", label: "Stock", icon: PlusCircle },
        { key: "Purchases", label: "Purchases", icon: ShoppingBag },
        { key: "Suppliers", label: "Suppliers", icon: Handshake }
      ]
    },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    {
      key: "sales",
        label: "Sales",
        icon: ShoppingBag ,
        isDropdown:true,
        children:[
          { key: "sales", label: "Sales Overview", icon: ShoppingBag },
        { key: "addSale", label: "Add Sale", icon: PlusCircle },
        { key: "salesHistory", label: "Sales History", icon: FileText },
        { key: "payment", label: "Payment", icon:DollarSign },
        { key: "salesRefunds", label: "Sales Refunds", icon: HandCoins }
      ]
    },
    {
      key: "expenses",
      label: "Expenses",
      icon: DollarSign,
      isDropdown: true,
      children: [
        { key: "addExpense", label: "Add Expense", icon: PlusCircle },
        { key: "expenseHistory", label: "Expense History", icon: Receipt },
        { key: "categories", label: "Categories", icon: ListTree },
        { key: "analytics", label: "Analytics", icon: FileText }
      ]
    },
  { key: "reviews", label: "Reviews", icon: Star },
  { 
    key: "reports",
    label: "Reports",
    icon: FileText,
    isDropdown: true,
    children: [
      { key: "businessSummary", label: "Business Summary", icon: FileText },
      { key: "salesAnalytics", label: "Sales Analytics", icon: ChartColumnIncreasing },
      { key:  "expenseReport", label: "Expense Report", icon: FileCheck},
      { key: "profit&loss", label: "Profit & Loss", icon: TrendingUp },
      { key: "inventory", label: "Inventory Report", icon: ClipboardCheck }
    ]
  },
  { key: "howToOrder", label: "How To Order", icon: Truck },
  { key: "profile", label: "Profile", icon: Settings },
  { key: "gotToWebsite", label: "Go to Website", icon: Globe }

];

