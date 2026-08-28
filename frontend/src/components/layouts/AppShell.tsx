import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Search, LogOut, X, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export interface ShellItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export function AppShell({
  children,
  items,
  role = "Estudiante",
  user = "Andrea Pérez",
}: {
  children: ReactNode;
  items: ShellItem[];
  role?: string;
  user?: string;
}) {
  const [open, setOpen] = useState(false);
  const { user: authUser, logout } = useAuth();
  const displayUser = authUser?.name ?? user;
  const location = useLocation();
  const sidebar = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
        <Logo variant="light" to={items[0]?.to ?? "/"} />
        <button
          className="text-white lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <X />
        </button>
      </div>
      <div className="px-4 py-5">
        <p className="mb-3 px-3 text-xs font-medium text-white/50">{role}</p>
        <nav className="space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 3}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/12 text-white"
                    : "text-white/65 hover:bg-white/7 hover:text-white",
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 text-gold" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-white/10 p-4">
        <button
          onClick={() => void logout()}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 hover:bg-white/7 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="navy-gradient sticky top-0 hidden h-screen flex-col lg:flex">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-navy/55"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <aside className="navy-gradient relative flex h-full w-[280px] flex-col">{sidebar}</aside>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-border bg-white/95 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </Button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="bg-muted pl-9" placeholder="Buscar en la plataforma..." />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-navy">{displayUser}</p>
              <p className="text-xs text-muted-foreground">{role}</p>
            </div>
            <UserAvatar
              tone={authUser?.avatarKey}
              initials={displayUser
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            />
          </div>
        </header>
        <main key={location.pathname} className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
