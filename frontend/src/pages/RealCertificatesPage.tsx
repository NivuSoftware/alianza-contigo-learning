import { useEffect, useState } from "react";
import { Award, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layouts/AppShell";
import { studentNav } from "@/components/layouts/nav";
import { CertificateMockup } from "@/components/shared/CertificateMockup";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError, downloadApiFile } from "@/lib/api";
import type { Certificate } from "@/types";

interface ApiCertificate extends Omit<Certificate, "issuedAt"> {
  issuedAt: string;
}

function printableCertificate(certificate: ApiCertificate): Certificate {
  return {
    ...certificate,
    issuedAt: new Intl.DateTimeFormat("es-EC", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(certificate.issuedAt)),
  };
}

export function RealCertificatesPage() {
  const [certificates, setCertificates] = useState<ApiCertificate[]>([]);
  const [selected, setSelected] = useState<ApiCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  async function downloadCertificate(certificate: ApiCertificate) {
    setDownloadingId(certificate.id);
    try {
      const blob = await downloadApiFile(`/exams/student/certificates/${certificate.id}/pdf`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificado-${certificate.courseSlug}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Certificado descargado correctamente.");
    } catch (reason) {
      toast.error(
        reason instanceof ApiError ? reason.message : "No pudimos descargar el certificado.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  useEffect(() => {
    api<{ certificates: ApiCertificate[] }>("/exams/student/certificates")
      .then((response) => setCertificates(response.certificates))
      .catch((reason) =>
        toast.error(
          reason instanceof ApiError ? reason.message : "No pudimos cargar tus certificados.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell items={studentNav}>
      <PageHeader
        title="Mis certificados"
        description="Tus certificados se emiten automáticamente al completar el curso y aprobar su examen final."
      />
      {loading ? (
        <div className="surface-card grid min-h-72 place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="surface-card grid min-h-72 place-items-center p-8 text-center">
          <div>
            <Award className="mx-auto h-11 w-11 text-gold" />
            <h2 className="mt-4 text-xl font-semibold text-navy">Aún no tienes certificados</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Completa todas las lecciones y aprueba el examen final para reclamar tu primer
              certificado de culminación.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate) => (
            <article
              key={certificate.id}
              className="surface-card group flex min-h-64 flex-col overflow-hidden"
            >
              <div className="relative flex h-28 items-center overflow-hidden bg-navy px-6">
                <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border-[10px] border-gold/70" />
                <p className="relative max-w-44 text-lg font-semibold leading-tight text-white">
                  Certificado de culminación
                </p>
                <Award className="relative ml-auto h-9 w-9 text-gold" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="line-clamp-2 font-display text-lg font-semibold text-navy">
                  {certificate.courseName}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Emitido el {printableCertificate(certificate).issuedAt}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{certificate.code}</p>
                <Button
                  variant="outline"
                  className="mt-auto w-full group-hover:border-gold"
                  onClick={() => setSelected(certificate)}
                >
                  <Eye /> Ver certificado
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[95vh] max-w-6xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pr-8">
            <DialogTitle>{selected?.courseName}</DialogTitle>
            <DialogDescription>Certificado de culminación listo para descargar.</DialogDescription>
          </DialogHeader>
          {selected && (
            <>
              <div>
                <CertificateMockup certificate={printableCertificate(selected)} />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="gold"
                  disabled={downloadingId === selected.id}
                  onClick={() => void downloadCertificate(selected)}
                >
                  {downloadingId === selected.id ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download />
                  )}
                  Descargar PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
