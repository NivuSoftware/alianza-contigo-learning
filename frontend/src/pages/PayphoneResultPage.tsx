import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, CircleAlert, CreditCard, Loader2, Phone } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { ACADEMY_PHONE_DISPLAY, ACADEMY_PHONE_E164, ACADEMY_WHATSAPP_URL } from "@/lib/contact";

interface Confirmation {
  status: "approved" | "rejected" | "error";
  message: string;
  reference: string;
  courseName: string;
  amount: number;
  currency: "USD";
  paidAt: string | null;
  providerTransactionId: string | null;
  redirect: string | null;
}

type ResultStatus = "validating" | "approved" | "rejected" | "error";

const money = new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" });
const date = new Intl.DateTimeFormat("es-EC", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Guayaquil",
});

export function PayphoneResultPage() {
  const [params] = useSearchParams();
  const transactionId = params.get("id");
  const clientTransactionId = params.get("clientTransactionId");
  const [status, setStatus] = useState<ResultStatus>(
    transactionId && clientTransactionId ? "validating" : "error",
  );
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState(
    transactionId && clientTransactionId
      ? ""
      : "No recibimos los datos de la transacción. Vuelve al programa o contacta a la academia si recibiste un cobro.",
  );

  useEffect(() => {
    if (!transactionId || !clientTransactionId) return undefined;
    let active = true;
    setStatus("validating");
    setError("");
    api<Confirmation>("/payments/payphone/confirm", {
      method: "POST",
      body: JSON.stringify({ id: transactionId, clientTransactionId }),
    })
      .then((result) => {
        if (!active) return;
        setConfirmation(result);
        setStatus(result.status);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setStatus("error");
        setError(
          reason instanceof ApiError
            ? reason.message
            : "No pudimos confirmar el pago con PayPhone. Contacta a la academia si recibiste un cobro.",
        );
      });
    return () => {
      active = false;
    };
  }, [transactionId, clientTransactionId]);

  const approved = status === "approved";
  const rejected = status === "rejected";
  const validating = status === "validating";
  const heading = validating
    ? "Estamos verificando tu pago"
    : approved
      ? "Compra exitosa"
      : rejected
        ? "Pago no aprobado"
        : "No pudimos validar tu pago";
  const description = validating
    ? "Consultamos directamente a PayPhone antes de activar tu inscripción. Esto puede tomar unos segundos."
    : approved
      ? "Tu inscripción está activa. El programa ya está disponible en tu aula virtual."
      : rejected
        ? confirmation?.message ||
          "PayPhone no aprobó esta transacción. Puedes volver a intentarlo."
        : error;

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-4 pt-14 pb-4 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mb-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-navy/70">
          <CreditCard className="h-4 w-4 text-gold" aria-hidden="true" />
          Pago de inscripción
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="border-b border-border px-6 py-9 sm:px-10 sm:py-11">
            <div
              className={`mb-6 flex h-14 w-14 items-center justify-center rounded-full ${approved ? "bg-emerald-50 text-emerald-700" : validating ? "bg-navy/5 text-navy" : "bg-amber-50 text-amber-800"}`}
              aria-hidden="true"
            >
              {approved ? (
                <Check className="h-7 w-7 stroke-[2.5]" />
              ) : validating ? (
                <Loader2 className="h-7 w-7 animate-spin motion-reduce:animate-none" />
              ) : (
                <CircleAlert className="h-7 w-7" />
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/80">
              {validating
                ? "Confirmación en curso"
                : approved
                  ? "Confirmado por PayPhone"
                  : "Revisa tu transacción"}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.025em] text-navy sm:text-4xl">
              {heading}
            </h1>
            <p
              className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base"
              role={status === "error" ? "alert" : "status"}
            >
              {description}
            </p>
          </div>

          <div className="px-6 py-8 sm:px-10 sm:py-9">
            {validating ? (
              <div className="space-y-4" aria-label="Preparando el detalle de la transacción">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
              </div>
            ) : approved && confirmation ? (
              <>
                <p className="text-sm font-semibold text-navy">Detalle de tu compra</p>
                <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
                  <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className="text-slate-600">Programa</dt>
                    <dd className="font-medium text-navy sm:text-right">
                      {confirmation.courseName}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-6 py-4">
                    <dt className="text-slate-600">Total pagado</dt>
                    <dd className="text-lg font-semibold text-navy">
                      {money.format(confirmation.amount)}
                    </dd>
                  </div>
                  {confirmation.paidAt && (
                    <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-6">
                      <dt className="text-slate-600">Fecha</dt>
                      <dd className="font-medium text-navy sm:text-right">
                        {date.format(new Date(confirmation.paidAt))}
                      </dd>
                    </div>
                  )}
                  <div className="flex flex-col gap-1 py-4 sm:flex-row sm:justify-between sm:gap-6">
                    <dt className="text-slate-600">Referencia</dt>
                    <dd className="break-all font-mono text-xs font-medium text-navy sm:text-right">
                      {confirmation.reference}
                    </dd>
                  </div>
                </dl>
                <Button asChild variant="gold" className="mt-8 w-full sm:w-auto">
                  <Link to={confirmation.redirect || "/app/courses"}>
                    Comenzar a estudiar <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                {clientTransactionId && (
                  <p className="break-all text-xs text-slate-600">
                    Referencia para soporte:{" "}
                    <span className="font-mono font-medium text-navy">{clientTransactionId}</span>
                  </p>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="gold">
                    <a href={ACADEMY_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      Consultar por WhatsApp <ArrowRight aria-hidden="true" />
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/courses">Ver programas</Link>
                  </Button>
                </div>
                <a
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
                  href={`tel:${ACADEMY_PHONE_E164}`}
                >
                  <Phone className="h-4 w-4" aria-hidden="true" /> {ACADEMY_PHONE_DISPLAY}
                </a>
              </>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-600">
          La inscripción se activa únicamente después de confirmar el pago con PayPhone.
        </p>
      </section>
    </PublicLayout>
  );
}
