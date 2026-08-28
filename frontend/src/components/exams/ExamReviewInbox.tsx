import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, SearchCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Attempt {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseSlug: string;
  attemptNumber: number;
  score: number;
  passingScore: number;
  status: "PENDING_REVIEW";
  submittedAt: string;
  feedback: string;
}

interface AttemptDetail extends Attempt {
  questions: Array<{
    questionId: string;
    prompt: string;
    options: string[];
    correctAnswers: number[];
    selectedAnswer: number;
    points: number;
  }>;
}

export function ExamReviewInbox({ courseSlug }: { courseSlug?: string }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [selected, setSelected] = useState<AttemptDetail | null>(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    return api<{ attempts: Attempt[] }>("/exams/teacher/attempts?status=PENDING_REVIEW")
      .then((response) => setAttempts(response.attempts))
      .catch((reason) =>
        toast.error(
          reason instanceof ApiError ? reason.message : "No pudimos cargar las evaluaciones.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleAttempts = useMemo(
    () => attempts.filter((attempt) => !courseSlug || attempt.courseSlug === courseSlug),
    [attempts, courseSlug],
  );

  async function openAttempt(attempt: Attempt) {
    try {
      const detail = await api<AttemptDetail>(`/exams/teacher/attempts/${attempt.id}`);
      setSelected(detail);
      setFeedback(detail.feedback || "");
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "No pudimos abrir la evaluación.");
    }
  }

  async function review() {
    if (!selected || saving) return;
    if (!feedback.trim()) {
      toast.error("Escribe una retroalimentación para el estudiante.");
      return;
    }
    setSaving(true);
    try {
      const response = await api<{ message: string; attemptsRemaining: number }>(
        `/exams/teacher/attempts/${selected.id}/review`,
        { method: "PATCH", body: JSON.stringify({ feedback }) },
      );
      toast.success(
        response.attemptsRemaining > 0
          ? `${response.message} El siguiente intento quedó habilitado.`
          : response.message,
      );
      setSelected(null);
      setFeedback("");
      await load();
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "No pudimos guardar la revisión.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="surface-card overflow-x-auto">
        {loading ? (
          <div className="h-64 animate-pulse bg-muted" />
        ) : visibleAttempts.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <SearchCheck className="mx-auto h-10 w-10 text-gold" />
              <h2 className="mt-4 font-semibold text-navy">No hay evaluaciones pendientes</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Aquí aparecerán únicamente los intentos reprobados que necesitan retroalimentación.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Curso</th>
                <th className="p-4">Intento</th>
                <th className="p-4">Resultado automático</th>
                <th className="p-4">Fecha</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td className="p-4">
                    <p className="font-medium text-navy">{attempt.studentName}</p>
                    <p className="text-xs text-muted-foreground">{attempt.studentEmail}</p>
                  </td>
                  <td className="p-4">{attempt.courseName}</td>
                  <td className="p-4">#{attempt.attemptNumber}</td>
                  <td className="p-4 text-red-700">
                    {attempt.score}/100 · mínimo {attempt.passingScore}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Intl.DateTimeFormat("es-EC", { dateStyle: "medium" }).format(
                      new Date(attempt.submittedAt),
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="outline" onClick={() => void openAttempt(attempt)}>
                      Revisar y retroalimentar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Intento #{selected?.attemptNumber} · {selected?.studentName}
            </DialogTitle>
            <DialogDescription>
              {selected?.courseName} · resultado automático {selected?.score}/100
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selected?.questions.map((question, index) => (
              <section key={question.questionId} className="rounded-xl bg-muted/60 p-4">
                <h3 className="text-sm font-semibold text-navy">
                  {index + 1}. {question.prompt}
                </h3>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const chosen = question.selectedAnswer === optionIndex;
                    const correct = question.correctAnswers.includes(optionIndex);
                    return (
                      <div
                        key={optionIndex}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm",
                          correct
                            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                            : chosen
                              ? "border-red-300 bg-red-50 text-red-900"
                              : "border-transparent text-muted-foreground",
                        )}
                      >
                        {option}
                        {correct && " · Respuesta correcta"}
                        {chosen && !correct && " · Respuesta del estudiante"}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
            <div className="space-y-2">
              <Label htmlFor="review-feedback">Retroalimentación para el estudiante</Label>
              <Textarea
                id="review-feedback"
                rows={5}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Explica qué debe reforzar antes del siguiente intento."
              />
            </div>
            <Button
              variant="gold"
              className="w-full"
              disabled={saving}
              onClick={() => void review()}
            >
              {saving ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Confirmar no aprobación y notificar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
