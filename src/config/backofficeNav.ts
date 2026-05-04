import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Package,
  Palette,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import type { UserRole } from "@/types";

export type BackofficeRole = Extract<UserRole, "admin" | "staff">;

export type BackofficeNavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: BackofficeRole[];
};

export const backofficeNavItems: BackofficeNavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Tổng quan", path: "/staff/dashboard", icon: ClipboardList, roles: ["staff"] },
  { label: "Người dùng", path: "/admin/users", icon: Users, roles: ["admin"] },
  { label: "Mặt hàng", path: "/admin/products", icon: Package, roles: ["admin"] },
  { label: "Mặt hàng", path: "/staff/products", icon: Package, roles: ["staff"] },
  { label: "Đơn hàng thường", path: "/admin/orders/available", icon: ShoppingCart, roles: ["admin"] },
  { label: "Đơn hàng thường", path: "/staff/orders/available", icon: ShoppingCart, roles: ["staff"] },
  { label: "Đơn hàng custom", path: "/admin/orders/custom", icon: Palette, roles: ["admin"] },
  { label: "Đơn hàng custom", path: "/staff/orders/custom", icon: Palette, roles: ["staff"] },
  { label: "Phiếu nhập hàng", path: "/admin/purchase-receipts", icon: FileText, roles: ["admin"] },
  { label: "Phiếu nhập hàng", path: "/staff/purchase-receipts", icon: FileText, roles: ["staff"] },
  { label: "Tồn kho", path: "/admin/inventory", icon: Warehouse, roles: ["admin"] },
  { label: "Tồn kho", path: "/staff/inventory", icon: Warehouse, roles: ["staff"] },
  { label: "Giao nhận", path: "/staff/delivery", icon: Truck, roles: ["staff"] },
];
