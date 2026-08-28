import { AppShell } from "@/components/layouts/AppShell";
import { adminNav } from "@/components/layouts/nav";
import { ExamReviewInbox } from "@/components/exams/ExamReviewInbox";
import { PageHeader } from "@/components/shared/PageHeader";

export function AdminEvaluationsPage() {
  return (
    <AppShell items={adminNav} role="Administrador">
      <PageHeader
        title="Evaluaciones por retroalimentar"
        description="Intentos no aprobados que requieren revisión antes de habilitar el siguiente intento."
      />
      <ExamReviewInbox />
    </AppShell>
  );
}
