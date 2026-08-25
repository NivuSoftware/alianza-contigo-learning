import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import hero from "@/assets/hero.jpg";

function AuthFrame({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="navy-gradient relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-20">
          <img src={hero} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-navy/65" />
        <Logo variant="light" className="relative" />
        <div className="relative mt-auto max-w-lg">
          <p className="font-display text-4xl font-semibold">Aprende. Crece. Trasciende.</p>
          <p className="mt-4 text-white/70">
            Formación profesional con acompañamiento y certificaciones con aval institucional.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-3xl font-semibold text-navy">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    navigate("/app");
  };
  return (
    <AuthFrame title="Bienvenido de nuevo" subtitle="Ingresa tus datos para continuar aprendiendo.">
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              defaultValue="andrea.perez@email.com"
              className="h-11 pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={show ? "text" : "password"}
              required
              defaultValue="alianza2026"
              className="h-11 px-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <Checkbox /> Recordarme
          </label>
          <button type="button" className="font-medium text-navy hover:text-gold">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <Button type="submit" variant="gold" size="lg" className="w-full">
          Iniciar sesión
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          ¿Aún no tienes cuenta?{" "}
          <Link to="/register" className="font-semibold text-navy hover:text-gold">
            Crear cuenta
          </Link>
        </p>
        <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Demo: cualquier correo y contraseña válidos permiten ingresar.
        </div>
      </form>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  return (
    <AuthFrame
      title="Crea tu cuenta"
      subtitle="Regístrate para acceder a tus programas y certificados."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate("/app");
        }}
        className="mt-8 grid gap-4 sm:grid-cols-2"
      >
        {[
          ["Nombres", "Andrea"],
          ["Apellidos", "Pérez"],
          ["Cédula", "1723456789"],
          ["Teléfono", "0998124470"],
          ["Correo electrónico", "andrea@email.com"],
          ["Contraseña", "alianza2026"],
          ["Confirmar contraseña", "alianza2026"],
        ].map(([label, value], i) => (
          <div key={label} className={i >= 4 ? "space-y-2 sm:col-span-2" : "space-y-2"}>
            <Label>{label}</Label>
            <Input
              required
              type={
                label!.includes("Contraseña")
                  ? "password"
                  : label === "Correo electrónico"
                    ? "email"
                    : "text"
              }
              defaultValue={value}
            />
          </div>
        ))}
        <label className="flex items-start gap-2 text-sm text-muted-foreground sm:col-span-2">
          <Checkbox required className="mt-0.5" />
          Acepto los términos y condiciones y la política de privacidad.
        </label>
        <Button variant="gold" size="lg" className="sm:col-span-2">
          Crear mi cuenta
        </Button>
        <p className="text-center text-sm text-muted-foreground sm:col-span-2">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-semibold text-navy">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
