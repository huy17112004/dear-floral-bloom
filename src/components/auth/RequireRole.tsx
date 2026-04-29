import { Navigate } from "react-router-dom";
import type { UserRole } from "@/types";

type RequireRoleProps = {
  allowed: UserRole[];
  children: JSX.Element;
};

export function RequireRole({ allowed, children }: RequireRoleProps) {
  const role = (localStorage.getItem("role") ?? "").toLowerCase() as UserRole;
  if (!allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
