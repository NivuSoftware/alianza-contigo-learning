import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  MonitorPlay,
  PlayCircle,
  Download,
  ClipboardCheck,
  CheckCircle2,
  BrainCircuit,
  Image,
} from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { CourseBadge } from "@/components/shared/CourseBadge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CertificateMockup } from "@/components/shared/CertificateMockup";
import { EnrollDialog } from "@/components/courses/EnrollDialog";
import { api } from "@/lib/api";
import { toPublicCourse } from "@/hooks/use-public-courses";
import type { Course } from "@/types";
import type { LmsCourse } from "@/types/lms";
import { useAuth } from "@/contexts/AuthContext";

const includes = [
  { icon: PlayCircle, label: "Clases en video" },
  { icon: FileText, label: "Documentos PDF" },
  { icon: Download, label: "Material descargable" },
  { icon: ClipboardCheck, label: "Evaluación final" },
  { icon: GraduationCap, label: "Certificado de aprobación" },
];

function ActivityIcon({ type }: { type: Course["modules"][number]["lessons"][number]["type"] }) {
  const Icon =
    type === "video"
      ? PlayCircle
      : type === "interactive"
        ? BrainCircuit
        : type === "image"
          ? Image
          : FileText;
  return <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />;
}

function activityName(type: Course["modules"][number]["lessons"][number]["type"]) {
  if (type === "video") return "Video";
  if (type === "interactive") return "Actividad interactiva";
  if (type === "image") return "Imagen";
  if (type === "pdf") return "Documento PDF";
  if (type === "resource") return "Recurso";
  return "Lectura";
}

export function CourseDetail() {
  const { slug = "" } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [owned, setOwned] = useState(false);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api<LmsCourse>(`/courses/${slug}`)
      .then((data) => setCourse(toPublicCourse(data)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);
  useEffect(() => {
    if (user?.role !== "student") {
      setOwned(false);
      setOwnershipLoading(false);
      return;
    }
    setOwnershipLoading(true);
    api<{ enrollments: Array<{ course: LmsCourse }> }>("/student/enrollments")
      .then(({ enrollments }) => setOwned(enrollments.some((item) => item.course.slug === slug)))
      .catch(() => setOwned(false))
      .finally(() => setOwnershipLoading(false));
  }, [slug, user]);
  if (loading)
    return (
      <PublicLayout>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="h-[520px] animate-pulse rounded-2xl bg-muted" />
        </div>
      </PublicLayout>
    );
  if (notFound || !course) return <Navigate to="/courses" replace />;
  const currency = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
  const hasDiscount = Boolean(course.discountPercent && course.originalPrice);

  const summary = [
    { icon: MonitorPlay, label: "Modalidad", value: course.modality },
    { icon: Clock, label: "Duración", value: course.duration },
    { icon: Layers, label: "Módulos", value: `${course.modules.length} módulos` },
    { icon: GraduationCap, label: "Certificación", value: course.certification },
  ];

  return (
    <PublicLayout>
      {/* HEADER */}
      <section className="navy-gradient relative overflow-hidden text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
          <div>
            <Breadcrumb>
              <BreadcrumbList className="text-white/50">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/" className="hover:text-gold">
                      Inicio
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/courses" className="hover:text-gold">
                      Programas
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-white">{course.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="mt-5 flex flex-wrap gap-2">
              {course.endorsements.map((e) => (
                <CourseBadge key={e} label={e} className="border-gold/40 bg-white/10 text-gold" />
              ))}
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{course.name}</h1>
            <p className="mt-3 text-sm font-semibold uppercase tracking-[0.14em] text-gold">
              Área de formación · {course.trainingArea.name}
            </p>
            <p className="mt-4 max-w-2xl text-white/70">{course.fullDescription}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {summary.map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <s.icon className="h-4.5 w-4.5 text-gold" />
                  <p className="mt-2 text-[11px] uppercase tracking-wider text-white/50">
                    {s.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="surface-card h-fit overflow-hidden p-0 lg:sticky lg:top-24">
            {course.image ? (
              <img
                src={course.image}
                alt={course.name}
                width={800}
                height={560}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="grid h-48 place-items-center bg-navy-soft text-center text-sm text-white/70">
                <span>
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-gold" />
                  Portada pendiente
                </span>
              </div>
            )}
            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs text-muted-foreground">Inversión</p>
                {hasDiscount && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground line-through">
                      {currency.format(course.originalPrice!)}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                      Ahorra {course.discountPercent}%
                    </span>
                  </div>
                )}
                <p className="mt-1 font-display text-3xl font-semibold text-navy">
                  {course.currentPrice !== undefined
                    ? currency.format(course.currentPrice)
                    : course.price}
                </p>
              </div>
              {authLoading || ownershipLoading ? (
                <div className="h-11 w-full animate-pulse rounded-lg bg-muted" />
              ) : owned ? (
                <Button asChild className="w-full" size="lg">
                  <Link to={`/app/classroom/${course.slug}`}>
                    <CheckCircle2 /> Ya compraste este curso · Ir al aula
                  </Link>
                </Button>
              ) : (
                <EnrollDialog
                  courseSlug={course.slug}
                  courseName={course.name}
                  amount={course.currentPrice || 0}
                  trigger={
                    <Button variant="gold" className="w-full" size="lg">
                      Inscribirme
                    </Button>
                  }
                />
              )}
              <ul className="space-y-2.5 border-t border-border pt-4">
                {includes.map((i) => (
                  <li
                    key={i.label}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <i.icon className="h-4 w-4 shrink-0 text-gold" />
                    {i.label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* CONTENIDO */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="gold-rule" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-navy">
            Contenido del programa
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Explora los módulos y lecciones incluidos en este programa.
          </p>

          <Accordion type="single" collapsible defaultValue="m1" className="mt-8">
            {course.modules.map((m, moduleIndex) => (
              <AccordionItem key={m.id} value={m.id} className="surface-card mb-3 border px-4">
                <AccordionTrigger className="hover:no-underline">
                  <span className="flex min-w-0 items-center gap-3 text-left">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-xs font-semibold text-gold">
                      {String(moduleIndex + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs text-muted-foreground">{m.title}</span>
                      <span className="block font-display font-semibold text-navy">
                        {m.subtitle}
                      </span>
                      {m.description && (
                        <span className="mt-1 block max-w-2xl text-sm font-normal leading-5 text-muted-foreground">
                          {m.description}
                        </span>
                      )}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 pl-1">
                    {m.lessons.map((l, lessonIndex) => (
                      <li
                        key={l.id}
                        className="rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent/50"
                      >
                        <div className="flex min-w-0 items-start gap-2.5">
                          <BookOpen className="h-4 w-4 shrink-0 text-gold" />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-navy">
                              Lección {lessonIndex + 1}: {l.title}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">1 actividad</p>
                            <div className="mt-2 flex items-center gap-2 rounded-md border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                              <ActivityIcon type={l.type} />
                              <span>{activityName(l.type)}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CERTIFICACIÓN */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto gold-rule" />
          <h2 className="mt-4 font-display text-3xl font-semibold text-navy">Tu certificación</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Al completar y aprobar satisfactoriamente el programa podrás obtener tu certificado
            correspondiente.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {course.endorsements.map((e) => (
              <CourseBadge key={e} label={e} />
            ))}
          </div>
          <div className="mt-10">
            <CertificateMockup
              certificate={{
                id: "preview",
                courseSlug: course.slug,
                courseName: course.name,
                studentName: "Nombre del Estudiante",
                issuedAt: "Fecha de aprobación",
                endorsement: course.endorsements[0] || "Alianza Contigo",
                code: "AC-2026-XXX-000000",
              }}
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
