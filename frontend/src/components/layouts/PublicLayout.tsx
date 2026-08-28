import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Menu,
  ArrowRight,
  ChevronDown,
  GraduationCap,
  Presentation,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const nav = [
  { label: "Inicio", to: "/" },
  { label: "Cursos", to: "/courses" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Contáctanos", to: "/contacto" },
] as const;

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const portalPath =
    user?.role === "admin" ? "/admin" : user?.role === "teacher" ? "/profesor" : "/app";
  const initials = user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border bg-white/90 shadow-[var(--shadow-soft)] backdrop-blur-md"
          : "border-transparent bg-white",
      )}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:bg-gold after:transition-transform after:duration-300 hover:text-navy",
                  isActive
                    ? "text-navy after:scale-x-100"
                    : "text-muted-foreground after:scale-x-0 hover:after:scale-x-100",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {loading ? (
            <div
              className="h-9 w-32 animate-pulse rounded-lg bg-muted"
              aria-label="Restaurando sesión"
            />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserAvatar initials={initials} tone={user.avatarKey} className="h-8 w-8" />
                  <span className="max-w-36 truncate">{user.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <span className="block truncate text-sm text-navy">{user.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={portalPath}>
                    <LayoutDashboard /> Ir a mi panel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void logout()} className="text-red-700">
                  <LogOut /> Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Iniciar sesión <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link to="/login" className="gap-3">
                    <GraduationCap className="h-4 w-4 text-gold" />
                    <span>
                      <strong className="block text-sm">Soy estudiante</strong>
                      <span className="text-xs text-muted-foreground">Acceder o registrarme</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/acceso-profesores" className="gap-3">
                    <Presentation className="h-4 w-4 text-gold" />
                    <span>
                      <strong className="block text-sm">Soy docente</strong>
                      <span className="text-xs text-muted-foreground">Ir al portal docente</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button asChild variant="gold" size="sm">
            <Link to="/courses">
              Ver cursos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {loading ? (
                  <div className="h-20 animate-pulse rounded-lg bg-muted" />
                ) : user ? (
                  <>
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-3">
                      <UserAvatar initials={initials} tone={user.avatarKey} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-navy">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to={portalPath}>
                        <LayoutDashboard /> Ir a mi panel
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start text-red-700"
                      onClick={() => {
                        setOpen(false);
                        void logout();
                      }}
                    >
                      <LogOut /> Cerrar sesión
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="px-2 pt-2 text-xs font-medium text-muted-foreground">
                      Iniciar sesión como
                    </p>
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/login">
                        <GraduationCap /> Soy estudiante
                      </Link>
                    </Button>
                    <Button asChild variant="outline" onClick={() => setOpen(false)}>
                      <Link to="/acceso-profesores">
                        <Presentation /> Soy docente
                      </Link>
                    </Button>
                  </>
                )}
                <Button asChild variant="gold" onClick={() => setOpen(false)}>
                  <Link to="/courses">Ver cursos</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="navy-gradient mt-24 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo variant="light" />
          <p className="mt-4 max-w-sm text-sm text-white/60">
            Educación continua con aval institucional para profesionales que buscan crecer y
            proyectarse en su carrera.
          </p>
          <p className="mt-6 text-xs tracking-[0.3em] text-gold">APRENDE | CRECE | TRASCIENDE</p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-white">Plataforma</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/courses" className="transition-colors hover:text-gold">
                Catálogo de cursos
              </Link>
            </li>
            <li>
              <Link to="/login" className="transition-colors hover:text-gold">
                Aula virtual
              </Link>
            </li>
            <li>
              <Link to="/admin" className="transition-colors hover:text-gold">
                Panel administrativo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold text-white">Contacto</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>info@alianzacontigo.edu.ec</li>
            <li>+593 99 000 0000</li>
            <li>Quito · Ecuador</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © 2026 Alianza Contigo — Educación Continua. Todos los derechos reservados.
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
