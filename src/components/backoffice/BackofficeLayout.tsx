import { Link, Outlet, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { ChevronLeft, Flower2, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { backofficeNavItems, type BackofficeRole } from "@/config/backofficeNav";

type BackofficeLayoutProps = {
  role: BackofficeRole;
};

export function BackofficeLayout({ role }: BackofficeLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const sidebarLinks = useMemo(
    () => backofficeNavItems.filter(item => item.roles.includes(role)),
    [role]
  );
  const currentLabel = sidebarLinks.find(link => location.pathname.startsWith(link.path))?.label
    ?? (role === "admin" ? "Admin" : "Staff");

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Flower2 className="h-6 w-6 text-sidebar-primary" />
              <div className="flex flex-col">
                <span className="font-heading text-lg font-semibold leading-tight text-sidebar-foreground">Dear Floral</span>
                <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">{role}</span>
              </div>
            </div>
          )}
          {collapsed && <Flower2 className="mx-auto h-6 w-6 text-sidebar-primary" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {sidebarLinks.map(link => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Về trang chủ</span>}
          </Link>
        </div>
      </aside>

      <div className={cn("flex-1 transition-all duration-300", collapsed ? "ml-16" : "ml-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur">
          <h2 className="font-heading text-lg font-semibold text-heading">{currentLabel}</h2>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
