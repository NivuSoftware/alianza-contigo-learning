import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Loader2,
  LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layouts/AppShell";
import { studentNav } from "@/components/layouts/nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { LmsCourse } from "@/types/lms";

interface EnrollmentItem {
  id: string;
  course: LmsCourse;
}

interface ExamQuestion {
  id: string;
  prompt: string;
  options: string[];
  points: number;
}

interface ExamState {
  lessonsComplete: boolean;
  attemptsUsed: number;
  attemptsAllowed: number;
  attemptsRemaining: number;
  pendingReview: boolean;
  courseCompleted: boolean;
  passedScore: number | null;
  canAttempt: boolean;
  attempts: Array<{
    id: string;
    number: number;
    status: "PASSED" | "PENDING_REVIEW" | "FAILED_REVIEWED";
    score: number | null;
    feedback: string;
    submittedAt: string;
  }>;
}

interface ExamResponse {
  exam: {
    id: string;
    title: string;
    instructions: string;
    timeLimitMinutes: number;
    passingScore: number;
    attemptsAllowed: number;
    questions: ExamQuestion[];
  };
  state: ExamState;
}

function celebrate() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const end = Date.now() + 1800;
  const colors = ["#C89432", "#D9AE55", "#071C3A", "#16A34A", "#FFFFFF"];
  const frame = () => {
    confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0 }, colors });
    confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function FinalExamPage() {
  const { slug = "" } = useParams();
  const [enrollment, setEnrollment] = useState<EnrollmentItem | null>(null);
  const [data, setData] = useState<ExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [passedResult, setPassedResult] = useState<number | null>(null);

  useEffect(() => {
    api<{ enrollments: EnrollmentItem[] }>("/student/enrollments")
      .then(async ({ enrollments }) => {
        const current = enrollments.find((item) => item.course.slug === slug);
        if (!current) throw new Error("not-found");
        setEnrollment(current);
        setData(await api<ExamResponse>(`/exams/student/enrollments/${current.id}`));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = Boolean(data && answeredCount === data.exam.questions.length);
  const currentQuestion = data?.exam.questions[index];
  const lastFeedback = useMemo(
    () => [...(data?.state.attempts || [])].reverse().find((attempt) => attempt.feedback),
    [data],
  );

  async function submit() {
    if (!enrollment || !allAnswered || submitting) return;
    setSubmitting(true);
    try {
      const result = await api<{
        passed: boolean;
        score?: number;
        status?: string;
        message: string;
      }>(`/exams/student/enrollments/${enrollment.id}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setConfirming(false);
      if (result.passed && result.score !== undefined) {
        setPassedResult(result.score);
        celebrate();
        toast.success("¡Curso completado y examen aprobado!");
      } else {
        setData((current) =>
          current
            ? {
                ...current,
                state: { ...current.state, pendingReview: true, canAttempt: false },
              }
            : current,
        );
        toast.info(result.message);
      }
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "No pudimos enviar el examen.");
    } finally {
      setSubmitting(false);
    }
  }

  const shell = (content: React.ReactNode) => (
    <AppShell items={studentNav}>
      <PageHeader
        title={data?.exam.title || "Examen final"}
        description={enrollment?.course.name || "Evaluación obligatoria del curso"}
        actions={
          <Button asChild variant="outline">
            <Link to={`/app/classroom/${slug}`}>Volver al aula</Link>
          </Button>
        }
      />
      {content}
    </AppShell>
  );

  if (loading) return shell(<div className="surface-card h-80 animate-pulse bg-muted" />);
  if (notFound || !enrollment || !data) return <Navigate to="/app/courses" replace />;
  if (!data.state.lessonsComplete)
    return shell(
      <div className="surface-card mx-auto max-w-2xl px-6 py-14 text-center">
        <LockKeyhole className="mx-auto h-11 w-11 text-gold" />
        <h2 className="mt-4 text-xl font-semibold text-navy">Examen todavía bloqueado</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Completa todos los módulos y lecciones para rendir la evaluación final.
        </p>
        <Button asChild className="mt-6">
          <Link to={`/app/classroom/${slug}`}>Continuar estudiando</Link>
        </Button>
      </div>,
    );

  const approvedScore = passedResult ?? data.state.passedScore;
  if (approvedScore !== null)
    return shell(
      <div className="surface-card mx-auto max-w-2xl px-6 py-14 text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <Award className="h-10 w-10" />
        </span>
        <h2 className="mt-5 font-display text-3xl font-semibold text-navy">
          ¡Felicitaciones, aprobaste!
        </h2>
        <p className="mt-3 text-muted-foreground">
          Completaste el curso y obtuviste una calificación de
        </p>
        <p className="mt-2 text-5xl font-semibold text-emerald-700">
          {approvedScore}
          <span className="text-2xl text-muted-foreground">/100</span>
        </p>
        <Button asChild variant="gold" className="mt-8">
          <Link to="/app/certificates">Reclamar mi certificado de culminación</Link>
        </Button>
      </div>,
    );

  if (data.state.pendingReview)
    return shell(
      <div className="surface-card mx-auto max-w-2xl px-6 py-14 text-center">
        <Clock3 className="mx-auto h-11 w-11 text-amber-600" />
        <h2 className="mt-4 text-xl font-semibold text-navy">Evaluación enviada al docente</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
          No alcanzaste el puntaje mínimo. Tu calificación permanecerá reservada; el docente
          revisará las respuestas, registrará su retroalimentación y te notificará por correo cuando
          el siguiente intento esté disponible.
        </p>
      </div>,
    );

  if (!data.state.canAttempt)
    return shell(
      <div className="surface-card mx-auto max-w-2xl px-6 py-14 text-center">
        <ClipboardCheck className="mx-auto h-11 w-11 text-gold" />
        <h2 className="mt-4 text-xl font-semibold text-navy">No quedan intentos disponibles</h2>
        {lastFeedback && (
          <div className="mx-auto mt-5 max-w-lg rounded-lg bg-muted p-4 text-left text-sm text-muted-foreground">
            <strong className="text-navy">Última retroalimentación:</strong>
            <p className="mt-1">{lastFeedback.feedback}</p>
          </div>
        )}
      </div>,
    );

  return shell(
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-navy px-5 py-4 text-white">
        <div>
          <p className="text-sm font-semibold">
            Intento {data.state.attemptsUsed + 1} de {data.exam.attemptsAllowed}
          </p>
          <p className="text-xs text-white/65">Puntaje mínimo: {data.exam.passingScore}%</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock3 className="h-4 w-4 text-gold" />
          {data.exam.timeLimitMinutes} minutos
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <section className="surface-card p-6">
          <p className="text-sm font-semibold text-gold">
            Pregunta {index + 1} de {data.exam.questions.length}
          </p>
          <h2 className="mt-3 text-lg font-semibold leading-7 text-navy">
            {currentQuestion?.prompt}
          </h2>
          <div className="mt-6 space-y-3">
            {currentQuestion?.options.map((option, optionIndex) => (
              <button
                key={optionIndex}
                type="button"
                onClick={() => setAnswers({ ...answers, [currentQuestion.id]: optionIndex })}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-4 text-left text-sm transition-colors",
                  answers[currentQuestion.id] === optionIndex
                    ? "border-gold bg-gold/10 text-navy"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                    answers[currentQuestion.id] === optionIndex
                      ? "border-gold bg-gold text-navy"
                      : "border-border",
                  )}
                >
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                {option}
              </button>
            ))}
          </div>
          <div className="mt-8 flex justify-between gap-3">
            <Button variant="outline" disabled={index === 0} onClick={() => setIndex(index - 1)}>
              <ChevronLeft />
              Anterior
            </Button>
            {index === data.exam.questions.length - 1 ? (
              <Button variant="gold" disabled={!allAnswered} onClick={() => setConfirming(true)}>
                Enviar evaluación
                <CheckCircle2 />
              </Button>
            ) : (
              <Button onClick={() => setIndex(index + 1)}>
                Siguiente
                <ChevronRight />
              </Button>
            )}
          </div>
        </section>
        <aside className="surface-card h-fit p-5">
          <h2 className="font-semibold text-navy">Preguntas</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {answeredCount} de {data.exam.questions.length} respondidas
          </p>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {data.exam.questions.map((question, questionIndex) => (
              <button
                key={question.id}
                onClick={() => setIndex(questionIndex)}
                className={cn(
                  "aspect-square rounded-md text-xs font-semibold",
                  questionIndex === index
                    ? "bg-navy text-white"
                    : answers[question.id] !== undefined
                      ? "bg-gold text-navy"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {questionIndex + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Enviar tu evaluación final?</DialogTitle>
            <DialogDescription>
              Después de enviarla no podrás modificar las respuestas de este intento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" disabled={submitting} onClick={() => setConfirming(false)}>
              Seguir revisando
            </Button>
            <Button variant="gold" disabled={submitting} onClick={() => void submit()}>
              {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}Confirmar envío
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>,
  );
}
