import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BookOpen,
  BadgeCheck,
  Clock3,
  GraduationCap,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { CourseCard } from "@/components/shared/CourseCard";
import { Button } from "@/components/ui/button";
import { usePublicCourses } from "@/hooks/use-public-courses";
import heroImage from "@/assets/hero.jpg";

const highlights = [
  { icon: GraduationCap, label: "Aprendizaje aplicado" },
  { icon: BadgeCheck, label: "Certificación y respaldo institucional" },
  { icon: Clock3, label: "Avanza a tu ritmo" },
];

const pillars = [
  {
    icon: Award,
    title: "Respaldo institucional",
    text: "Cada programa identifica de manera clara la institución responsable, su certificación y el respaldo que corresponda.",
  },
  {
    icon: Users,
    title: "Docentes con experiencia",
    text: "Aprende juntos a profesionales que conectan los contenidos con situaciones y desafíos de ejercicio profesional.",
  },
  {
    icon: TrendingUp,
    title: "Progreso medible",
    text: "Avanza mediante módulos, actividades y evaluaciones que permiten evidenciar tu proceso de aprendizaje.",
  },
];

export function Landing() {
  const { courses, loading } = usePublicCourses();
  return (
    <PublicLayout>
      {/* HERO */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Educación continua para crecer profesionalmente
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] text-navy sm:text-5xl lg:text-6xl">
              Impulsa tu <span className="text-gradient-gold">crecimiento profesional</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Programas de educación continua diseñados para desarrollar conocimientos y competencias aplicables a tu vida profesional.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/courses">
                  Explorar programas <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
              {highlights.map((h) => (
                <div key={h.label} className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-gold">
                    <h.icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-sm font-medium text-navy">{h.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -bottom-6 -left-6 hidden h-40 w-40 rounded-2xl border border-gold/30 sm:block" />
            <img
              src={heroImage}
              alt="Profesionales en una capacitación empresarial de Alianza Contigo"
              width={1408}
              height={1008}
              className="relative w-full rounded-2xl object-cover shadow-[var(--shadow-lift)]"
            />
            <div className="surface-card absolute -bottom-8 left-4 hidden w-56 p-4 sm:block">
              <p className="text-xs text-muted-foreground">Estudiantes formados</p>
              <p className="font-display text-2xl font-semibold text-navy">+2.400</p>
              <p className="mt-1 text-xs text-gold">Aprende · Crece · Trasciende</p>
            </div>
          </div>
        </div>
      </section>

      {/* PILARES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="surface-card hover-lift p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy text-gold">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-navy">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programas */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="gold-rule" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-navy sm:text-4xl">
            Programas que impulsan tu crecimiento
          </h2>
          <p className="mt-3 text-muted-foreground">
            Elige el programa que se adapte a tus objetivos y aprende mediante contenidos, actividades y evaluaciones diseñadas para avanzar paso a paso.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[430px] animate-pulse rounded-2xl bg-muted" />
            ))}
          {courses.slice(0, 6).map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
        {!loading && courses.length === 0 && (
          <div className="mt-10 rounded-xl bg-white p-8 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-gold" />
            <p className="mt-3 font-medium text-navy">Próximamente nuevos programas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Estamos preparando nuestra próxima oferta académica.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="navy-gradient relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
          <p className="text-xs tracking-[0.35em] text-gold">APRENDE | CRECE | TRASCIENDE</p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
            Da el siguiente paso en tu carrera
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
            Inscríbete en el programa que mejor se adapte a tus objetivos y obtén tu certificado con
            aval institucional.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/courses">Ver todos los Programas</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/contacto">Hablar con un asesor</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
