import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Clock3, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layouts/AppShell";
import { teacherNav } from "@/components/layouts/nav";
import { ExamReviewInbox } from "@/components/exams/ExamReviewInbox";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { LmsCourse } from "@/types/lms";

interface CourseStudent {
  enrollmentId: string;
  name: string;
  email: string;
  progressPercent: number;
  examSubmittedAt?: string;
  examScore?: number;
  examStatus?: "NOT_STARTED" | "PENDING_REVIEW" | "FAILED_REVIEWED" | "PASSED";
  teacherFeedback: string;
}
export function TeacherCoursePage() {
  const { slug = "" } = useParams();
  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const load = useCallback(
    () =>
      api<{ course: LmsCourse; students: CourseStudent[] }>(`/courses/${slug}/teaching`)
        .then((data) => {
          setCourse(data.course);
          setStudents(data.students);
        })
        .catch((e) => toast.error(e.message)),
    [slug],
  );
  useEffect(() => {
    void load();
  }, [load]);
  return (
    <AppShell items={teacherNav} role="Profesor">
      <PageHeader
        title={course?.name || "Curso"}
        description="Consulta el avance y revisa evaluaciones enviadas."
      />
      <div className="surface-card overflow-x-auto">
        {students.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <Users className="mx-auto h-9 w-9 text-gold" />
              <h2 className="mt-4 font-semibold text-navy">Aún no hay estudiantes inscritos</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Los estudiantes aparecerán aquí cuando sean matriculados.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Avance</th>
                <th className="p-4">Evaluación final</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map((student) => (
                <tr key={student.enrollmentId}>
                  <td className="p-4">
                    <p className="font-medium text-navy">{student.name}</p>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </td>
                  <td className="p-4">
                    <div className="h-2 w-36 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${student.progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs">{student.progressPercent}%</p>
                  </td>
                  <td className="p-4">
                    {student.examStatus === "PASSED" ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Aprobada · {student.examScore}/100
                      </span>
                    ) : student.examStatus === "PENDING_REVIEW" ? (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Clock3 className="h-4 w-4" />
                        Pendiente de revisión
                      </span>
                    ) : student.examStatus === "FAILED_REVIEWED" ? (
                      <span className="text-red-700">No aprobada · retroalimentada</span>
                    ) : (
                      <span className="text-muted-foreground">No rendida</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {student.examSubmittedAt ? (
                      <Button asChild size="sm" variant="outline">
                        <a href="#evaluaciones-pendientes">Ver revisión</a>
                      </Button>
                    ) : (
                      <Button size="sm" disabled>
                        Sin evaluación
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <section id="evaluaciones-pendientes" className="mt-8 scroll-mt-28">
        <PageHeader
          title="Evaluaciones pendientes"
          description="Revisa aquí los intentos no aprobados de este curso y habilita el siguiente intento mediante retroalimentación."
        />
        <ExamReviewInbox courseSlug={slug} />
      </section>
    </AppShell>
  );
}
