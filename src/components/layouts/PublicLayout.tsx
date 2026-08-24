import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Inicio", to: "/" },
  { label: "Cursos", to: "/courses" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Certificaciones", to: "/certificaciones" },
  { label: "Contáctanos", to: "/contacto" },
] as const;

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-navy after:scale-x-100" }}
              className="relative text-sm font-medium text-muted-foreground transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-300 hover:text-navy hover:after:scale-x-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
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
                <Button asChild variant="outline" onClick={() => setOpen(false)}>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
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
              <Link to="/certificaciones" className="transition-colors hover:text-gold">
                Certificaciones
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
