import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Lock,
  Play,
  PlayCircle,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AppShell } from "@/components/layouts/AppShell";
import { studentNav } from "@/components/layouts/nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { CourseProgressCard } from "@/components/shared/CourseProgressCard";
import { CertificateMockup } from "@/components/shared/CertificateMockup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { courses, getCourse } from "@/mocks/courses";
import {
  certificates,
  currentStudent,
  enrollments,
  examQuestions,
  studentStats,
} from "@/mocks/student";
import { cn } from "@/lib/utils";

const Shell = ({ children }: { children: React.ReactNode }) => (
  <AppShell items={studentNav}>{children}</AppShell>
);
const statsIcons = [BookOpen, CheckCircle2, Award, Clock];

export function StudentDashboard() {
  const active = enrollments.filter((e) => e.status === "En progreso");
  return (
    <Shell>
      <PageHeader
        title={`Hola, ${currentStudent.firstName} 👋`}
        description="Continúa avanzando hacia tus objetivos profesionales."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {studentStats.map((s, i) => (
          <StatsCard key={s.label} {...s} icon={statsIcons[i]!} />
        ))}
      </div>
      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-navy">Continúa aprendiendo</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Retoma tu última lección y mantén el ritmo.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/app/courses">Ver todos</Link>
          </Button>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {active.map((e) => (
            <CourseProgressCard
              key={e.courseSlug}
              enrollment={e}
              course={getCourse(e.courseSlug)!}
            />
          ))}
        </div>
      </section>
    </Shell>
  );
}

export function MyCoursesPage() {
  const [filter, setFilter] = useState("Todos");
  const filtered = enrollments.filter((e) => filter === "Todos" || e.status === filter);
  return (
    <Shell>
      <PageHeader
        title="Mis cursos"
        description="Todos tus programas y su avance en un solo lugar."
      />
      <div className="mb-6 flex flex-wrap gap-2">
        {["Todos", "En progreso", "Completado", "Pendiente"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "navy" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        {filtered.map((e) => (
          <CourseProgressCard key={e.courseSlug} enrollment={e} course={getCourse(e.courseSlug)!} />
        ))}
      </div>
    </Shell>
  );
}

export function ClassroomPage() {
  const { slug = "" } = useParams();
  const course = getCourse(slug);
  if (!course) return <Navigate to="/app/courses" />;
  const current =
    course.modules.flatMap((m) => m.lessons).find((l) => l.state === "current") ??
    course.modules[0]!.lessons[0]!;
  return (
    <Shell>
      <PageHeader
        title={course.name}
        description="Aula virtual · tu avance se guarda automáticamente."
        actions={
          <Button asChild variant="outline">
            <Link to="/app/courses">Salir del aula</Link>
          </Button>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0">
          <div className="grid aspect-video place-items-center overflow-hidden rounded-xl bg-navy text-white">
            <div className="text-center">
              <button
                className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-white transition-transform hover:scale-105"
                aria-label="Reproducir lección"
              >
                <Play className="ml-1 h-7 w-7" />
              </button>
              <p className="mt-4 text-sm text-white/65">Vista previa del reproductor</p>
            </div>
          </div>
          <h2 className="mt-6 font-display text-2xl font-semibold text-navy">{current.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{current.description}</p>
          <Tabs defaultValue="content" className="mt-6">
            <TabsList>
              <TabsTrigger value="content">Contenido</TabsTrigger>
              <TabsTrigger value="resources">Recursos</TabsTrigger>
              <TabsTrigger value="notes">Notas</TabsTrigger>
            </TabsList>
            <TabsContent
              value="content"
              className="surface-card mt-4 p-5 text-sm text-muted-foreground"
            >
              En esta lección aprenderás a articular procesos, personas y recursos para alcanzar
              objetivos estratégicos medibles.
            </TabsContent>
            <TabsContent value="resources" className="surface-card mt-4 p-5">
              <Button variant="outline">
                <Download />
                Descargar guía de estudio
              </Button>
            </TabsContent>
            <TabsContent value="notes" className="surface-card mt-4 p-5">
              <textarea
                className="min-h-32 w-full resize-y rounded-lg border border-input p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Escribe tus notas de esta lección..."
              />
              <Button className="mt-3">
                <Save />
                Guardar notas
              </Button>
            </TabsContent>
          </Tabs>
        </section>
        <aside className="surface-card h-fit overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="font-display font-semibold text-navy">Contenido del curso</h2>
            <p className="mt-1 text-xs text-muted-foreground">65% completado</p>
          </div>
          <div className="max-h-[680px] overflow-y-auto p-3">
            {course.modules.map((m) => (
              <div key={m.id} className="mb-4">
                <p className="px-2 py-2 text-xs font-semibold text-navy">
                  {m.title} · {m.subtitle}
                </p>
                {m.lessons.map((l) => {
                  const icon =
                    l.state === "completed"
                      ? Check
                      : l.state === "current"
                        ? PlayCircle
                        : l.state === "locked"
                          ? Lock
                          : BookOpen;
                  const Icon = icon;
                  return (
                    <button
                      key={l.id}
                      disabled={l.state === "locked"}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm",
                        l.state === "current"
                          ? "bg-accent font-medium text-navy"
                          : "text-muted-foreground hover:bg-muted",
                        l.state === "locked" && "cursor-not-allowed opacity-55",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          l.state === "completed" || l.state === "current" ? "text-gold" : "",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                      <span className="text-[11px]">{l.duration}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </Shell>
  );
}

export function ExamPage() {
  const [index, setIndex] = useState(3);
  const [answers, setAnswers] = useState<Record<string, string>>({ q1: "0", q2: "1", q3: "0" });
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const q = examQuestions[index]!;
  if (sent)
    return (
      <Shell>
        <div className="mx-auto max-w-xl py-16 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-navy">
            Tu evaluación fue enviada correctamente.
          </h1>
          <p className="mt-3 text-muted-foreground">
            El docente revisará tus respuestas y posteriormente podrás visualizar tu calificación.
          </p>
          <Button asChild className="mt-8">
            <Link to="/app">Volver al inicio</Link>
          </Button>
        </div>
      </Shell>
    );
  return (
    <Shell>
      <PageHeader
        title="Evaluación Final — Gestor Empresarial"
        description="20 preguntas · Puntaje requerido configurable"
        actions={
          <div className="rounded-lg bg-navy px-4 py-2 text-white">
            <span className="text-xs text-white/60">Tiempo disponible</span>
            <p className="font-mono text-lg">45:00</p>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="surface-card p-6">
          <p className="text-sm font-medium text-gold">Pregunta {index + 1} de 20</p>
          <h2 className="mt-3 text-lg font-semibold text-navy">{q.text}</h2>
          <RadioGroup
            value={answers[q.id] ?? ""}
            onValueChange={(v) => setAnswers({ ...answers, [q.id]: v })}
            className="mt-6 space-y-3"
          >
            {q.options.map((o, i) => (
              <label
                key={o}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-4 hover:bg-accent/40"
              >
                <RadioGroupItem value={String(i)} /> <span className="text-sm text-navy">{o}</span>
              </label>
            ))}
          </RadioGroup>
          <div className="mt-8 flex justify-between">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              Anterior
            </Button>
            {index === 19 ? (
              <Button variant="gold" onClick={() => setOpen(true)}>
                Enviar evaluación
              </Button>
            ) : (
              <Button onClick={() => setIndex(index + 1)}>Siguiente</Button>
            )}
          </div>
        </section>
        <aside className="surface-card h-fit p-5">
          <h2 className="font-semibold text-navy">Navegación</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {examQuestions.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setIndex(i)}
                className={cn(
                  "aspect-square rounded-md text-xs font-medium",
                  i === index
                    ? "bg-navy text-white"
                    : answers[item.id]
                      ? "bg-gold text-white"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button variant="gold" className="mt-6 w-full" onClick={() => setOpen(true)}>
            Enviar evaluación
          </Button>
        </aside>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Deseas finalizar tu evaluación?</DialogTitle>
            <DialogDescription>
              Después de enviarla no podrás modificar tus respuestas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Seguir revisando
            </Button>
            <Button variant="gold" onClick={() => setSent(true)}>
              Sí, enviar evaluación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}

export function ExamResultPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-success/15 text-success">
          <Award className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-navy">
          ¡Felicitaciones! Has aprobado tu evaluación.
        </h1>
        <p className="mt-4 text-muted-foreground">Tu calificación</p>
        <p className="mt-1 font-display text-5xl font-semibold text-navy">
          92 <span className="text-2xl text-muted-foreground">/ 100</span>
        </p>
        <Button asChild variant="gold" className="mt-8">
          <Link to="/app/certificates">Ver certificado</Link>
        </Button>
      </div>
    </Shell>
  );
}

export function CertificatesPage() {
  return (
    <Shell>
      <PageHeader
        title="Mis certificados"
        description="Consulta y descarga tus logros académicos."
      />
      <div className="space-y-8">
        {certificates.map((c) => (
          <section key={c.id} className="surface-card p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-navy">{c.courseName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Aprobado el {c.issuedAt} · {c.endorsement}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText />
                  Ver certificado
                </Button>
                <Button variant="gold">
                  <Download />
                  Descargar PDF
                </Button>
              </div>
            </div>
            <CertificateMockup certificate={c} />
          </section>
        ))}
      </div>
    </Shell>
  );
}

export function ProfilePage() {
  return (
    <Shell>
      <PageHeader
        title="Mi perfil"
        description="Administra tu información personal y la seguridad de tu cuenta."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <form className="surface-card p-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-navy text-xl font-semibold text-white">
              AP
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-navy">Andrea Pérez</h2>
              <p className="text-sm text-muted-foreground">Estudiante activa</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              ["Nombre", currentStudent.name],
              ["Correo", currentStudent.email],
              ["Teléfono", currentStudent.phone],
              ["Cédula", currentStudent.idCard],
            ].map(([l, v]) => (
              <div className="space-y-2" key={l}>
                <Label>{l}</Label>
                <Input defaultValue={v} />
              </div>
            ))}
          </div>
          <Button className="mt-6">
            <UserRound />
            Editar perfil
          </Button>
        </form>
        <form className="surface-card p-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-gold" />
            <h2 className="font-display text-xl font-semibold text-navy">Seguridad</h2>
          </div>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>Contraseña actual</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Nueva contraseña</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar contraseña</Label>
              <Input type="password" />
            </div>
          </div>
          <Button variant="outline" className="mt-6">
            Cambiar contraseña
          </Button>
        </form>
      </div>
    </Shell>
  );
}
