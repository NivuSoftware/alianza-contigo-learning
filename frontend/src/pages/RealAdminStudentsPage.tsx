import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Activity, BookOpen, CalendarDays, Mail, Phone, Search, UserRound } from "lucide-react";
import { AppShell } from "@/components/layouts/AppShell";
import { adminNav } from "@/components/layouts/nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api, ApiError } from "@/lib/api";
import type { AuthUser } from "@/contexts/AuthContext";
import type { LmsCourse } from "@/types/lms";

interface AdminStudent extends AuthUser {
  createdAt: string;
  coursesCount: number;
  isActive: boolean;
}

interface DetailResponse {
  student: Omit<AdminStudent, "coursesCount">;
  enrollments: Array<{
    id: string;
    course: LmsCourse;
    progressPercent: number;
    examScore: number | null;
    enrolledAt: string;
  }>;
}

const date = (value: string) =>
  new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(new Date(value));

export function RealStudentsPage() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    api<{ students: AdminStudent[] }>("/admin/students")
      .then((response) => setStudents(response.students))
      .catch((reason) =>
        setError(
          reason instanceof ApiError ? reason.message : "No pudimos cargar los estudiantes.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);
  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.name, student.email, student.nationalId, student.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term)),
    );
  }, [query, students]);
  return (
    <AppShell items={adminNav} role="Administrador">
      <PageHeader
        title="Estudiantes"
        description="Cuentas registradas y cursos habilitados en la academia."
      />
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nombre, correo, cédula o teléfono"
          className="pl-9"
        />
      </div>
      <div className="surface-card overflow-x-auto">
        {loading ? (
          <div className="h-64 animate-pulse bg-muted" />
        ) : error ? (
          <p className="p-6 text-sm text-red-700">{error}</p>
        ) : rows.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div>
              <UserRound className="mx-auto h-9 w-9 text-gold" />
              <h2 className="mt-3 font-semibold text-navy">No se encontraron estudiantes</h2>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[920px] text-sm">
            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Cédula</th>
                <th className="p-4">Cursos</th>
                <th className="p-4">Registro</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((student) => {
                const initials = `${student.firstName[0] ?? ""}${student.lastName[0] ?? ""}`;
                return (
                  <tr key={student.id} className="hover:bg-muted/35">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar initials={initials} tone={student.avatarKey} />
                        <div>
                          <p className="font-medium text-navy">{student.name}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{student.phone || "Sin teléfono"}</td>
                    <td className="p-4">{student.nationalId || "No registrada"}</td>
                    <td className="p-4 font-semibold text-navy">{student.coursesCount}</td>
                    <td className="p-4 text-muted-foreground">{date(student.createdAt)}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          student.isActive
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {student.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/admin/students/${student.id}`}>Ver perfil</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}

export function RealStudentDetail() {
  const { id = "" } = useParams();
  const [data, setData] = useState<DetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    api<DetailResponse>(`/admin/students/${id}`)
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);
  if (loading)
    return (
      <AppShell items={adminNav} role="Administrador">
        <div className="surface-card h-72 animate-pulse bg-muted" />
      </AppShell>
    );
  if (notFound || !data) return <Navigate to="/admin/students" replace />;
  const average = data.enrollments.length
    ? Math.round(
        data.enrollments.reduce((sum, item) => sum + item.progressPercent, 0) /
          data.enrollments.length,
      )
    : 0;
  const student = data.student;
  return (
    <AppShell items={adminNav} role="Administrador">
      <PageHeader
        title={student.name}
        description="Perfil académico y matrículas reales del estudiante."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/students">Volver al listado</Link>
          </Button>
        }
      />
      <section className="surface-card mb-6 flex flex-wrap items-center gap-5 p-6">
        <UserAvatar
          initials={`${student.firstName[0] ?? ""}${student.lastName[0] ?? ""}`}
          tone={student.avatarKey}
          className="h-16 w-16 text-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-semibold text-navy">{student.name}</h2>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4 text-gold" />
              {student.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-gold" />
              {student.phone || "Sin teléfono"}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-gold" />
              Registro: {date(student.createdAt)}
            </span>
          </div>
        </div>
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard
          label="Cursos adquiridos"
          value={String(data.enrollments.length)}
          icon={BookOpen}
        />
        <StatsCard label="Progreso promedio" value={`${average}%`} icon={Activity} />
        <StatsCard label="Cédula" value={student.nationalId || "No registrada"} icon={UserRound} />
      </div>
      <section className="surface-card mt-6 overflow-x-auto">
        <div className="border-b border-border p-5">
          <h2 className="font-display font-semibold text-navy">Cursos habilitados</h2>
        </div>
        {data.enrollments.length ? (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Curso</th>
                <th className="p-4">Fecha de acceso</th>
                <th className="p-4">Progreso</th>
                <th className="p-4">Examen</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.enrollments.map((item) => (
                <tr key={item.id}>
                  <td className="p-4 font-medium text-navy">{item.course.name}</td>
                  <td className="p-4 text-muted-foreground">{date(item.enrolledAt)}</td>
                  <td className="p-4">{item.progressPercent}%</td>
                  <td className="p-4">
                    {item.examScore === null ? "Sin calificar" : `${item.examScore}/100`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            Este estudiante todavía no tiene cursos habilitados.
          </p>
        )}
      </section>
    </AppShell>
  );
}
