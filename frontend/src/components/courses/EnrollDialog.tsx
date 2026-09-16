import { useEffect, useId, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  LockKeyhole,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api, apiForm, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface BankDetails {
  bank: string;
  accountType: string;
  accountNumber: string;
  holder: string;
  holderId: string;
}
interface CheckoutResponse {
  message: string;
  reference: string;
  redirect?: string | null;
}
interface PayphoneCheckout {
  token: string;
  storeId: string;
  clientTransactionId: string;
  reference: string;
  amount: number;
  amountWithoutTax: number;
  currency: "USD";
  email: string;
}

declare global {
  interface Window {
    PPaymentButtonBox?: new (
      options: PayphoneCheckout & {
        lang: string;
        defaultMethod: string;
        timeZone: number;
        isAsyncResponse: boolean;
        showPaymentMethodSelector: boolean;
        showPayphonePayment: boolean;
        showCashPayment: boolean;
        showClickToPay: boolean;
      },
    ) => {
      render: (id: string) => void;
    };
  }
}

const PAYPHONE_CDN = "https://cdn.payphonetodoesposible.com/box/v2.0";

function loadPayphoneSdk(): Promise<void> {
  if (!document.querySelector('link[data-payphone-box="true"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = `${PAYPHONE_CDN}/payphone-payment-box.css`;
    stylesheet.dataset["payphoneBox"] = "true";
    document.head.appendChild(stylesheet);
  }
  if (window.PPaymentButtonBox) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "module";
    script.src = `${PAYPHONE_CDN}/payphone-payment-box.js`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPhone."));
    document.head.appendChild(script);
  });
}

export function EnrollDialog({
  courseSlug,
  courseName,
  amount,
  trigger,
}: {
  courseSlug: string;
  courseName: string;
  amount: number;
  trigger: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const proofInputId = useId();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState<CheckoutResponse | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [payphone, setPayphone] = useState<PayphoneCheckout | null>(null);
  const [payphoneError, setPayphoneError] = useState("");
  const [validating, setValidating] = useState(false);
  const [uncertainPayment, setUncertainPayment] = useState(false);
  useEffect(() => {
    if (open && user?.role === "student")
      api<BankDetails>("/payments/bank-details")
        .then(setBank)
        .catch(() => undefined);
  }, [open, user]);
  useEffect(() => {
    if (!open || !payphone) return undefined;
    let cancelled = false;
    const onPaymentResult = (event: Event) => {
      const detail: unknown = (event as CustomEvent<unknown>).detail;
      if (typeof detail === "string") {
        if (detail !== "errorValidation")
          setPayphoneError(
            "PayPhone no pudo procesar la tarjeta. Revisa los datos e intenta nuevamente.",
          );
        return;
      }
      if (!detail || typeof detail !== "object") return;
      const result = detail as { transactionId?: number | string; clientTransactionId?: string };
      if (!result.transactionId || result.clientTransactionId !== payphone.clientTransactionId) {
        setUncertainPayment(true);
        setPayphoneError(
          "PayPhone no devolvió una transacción válida. Contacta a soporte si recibiste un cobro.",
        );
        return;
      }
      setValidating(true);
      setPayphoneError("");
      const query = new URLSearchParams({
        id: String(result.transactionId),
        clientTransactionId: result.clientTransactionId,
      });
      navigate(`/pagar?${query.toString()}`);
    };
    window.addEventListener("processPaymentAsync", onPaymentResult);
    loadPayphoneSdk()
      .then(() => {
        if (cancelled) return;
        const ButtonBox = window.PPaymentButtonBox;
        if (!ButtonBox) throw new Error("PayPhone no está disponible en este navegador.");
        new ButtonBox({
          ...payphone,
          lang: "es",
          defaultMethod: "card",
          timeZone: -5,
          isAsyncResponse: true,
          showPaymentMethodSelector: false,
          showPayphonePayment: false,
          showCashPayment: false,
          showClickToPay: false,
        }).render("pp-button");
      })
      .catch((error: unknown) => {
        if (!cancelled)
          setPayphoneError(error instanceof Error ? error.message : "No se pudo cargar PayPhone.");
      });
    return () => {
      cancelled = true;
      window.removeEventListener("processPaymentAsync", onPaymentResult);
    };
  }, [open, payphone, navigate]);
  function changeOpen(next: boolean) {
    if (next && !user) {
      navigate("/login", { state: { from: location.pathname, checkout: courseSlug } });
      toast.info("Inicia sesión para inscribirte");
      return;
    }
    if (next && user?.role !== "student") {
      toast.error("Debes ingresar con una cuenta de estudiante.");
      return;
    }
    setOpen(next);
    if (!next) {
      setComplete(null);
      setPayphone(null);
      setPayphoneError("");
      setValidating(false);
      setUncertainPayment(false);
    }
  }
  async function payCard() {
    setLoading(true);
    try {
      const result = await api<PayphoneCheckout>("/payments/card", {
        method: "POST",
        body: JSON.stringify({ courseSlug }),
      });
      setPayphone(result);
      setPayphoneError("");
      setUncertainPayment(false);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  }
  async function sendTransfer() {
    if (!proof) {
      toast.error("Carga tu comprobante de pago.");
      return;
    }
    setLoading(true);
    try {
      const body = new FormData();
      body.append("courseSlug", courseSlug);
      body.append("proof", proof);
      const result = await apiForm<CheckoutResponse>("/payments/transfer", body);
      setComplete(result);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo enviar el comprobante");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">Finaliza tu inscripción</DialogTitle>
          <DialogDescription>
            {courseName} · Total a pagar <strong>${amount.toFixed(2)}</strong>
          </DialogDescription>
        </DialogHeader>
        {complete ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <h3 className="mt-4 text-xl font-semibold text-navy">Comprobante recibido</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {complete.message}
            </p>
            <p className="mt-3 text-xs font-medium text-navy">Referencia {complete.reference}</p>
            <Button className="mt-6" variant="gold" onClick={() => setOpen(false)}>
              Entendido
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="card">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card">
                <CreditCard />
                Tarjeta
              </TabsTrigger>
              <TabsTrigger value="transfer">
                <Building2 />
                Transferencia
              </TabsTrigger>
            </TabsList>
            <TabsContent value="card" className="mt-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                Paga de forma segura con PayPhone. Los datos de tu tarjeta se ingresan directamente
                en su Cajita de Pagos.
              </p>
              {payphone ? (
                <>
                  <div id="pp-button" />
                  {validating && (
                    <p className="text-sm font-medium text-navy">
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Abriendo la verificación del pago…
                    </p>
                  )}
                  {payphoneError && <p className="text-sm text-destructive">{payphoneError}</p>}
                  {!uncertainPayment && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setPayphone(null);
                        setPayphoneError("");
                      }}
                    >
                      Generar una nueva cajita
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  variant="gold"
                  className="w-full"
                  disabled={loading}
                  onClick={() => void payCard()}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Pagar $
                  {amount.toFixed(2)} con PayPhone
                </Button>
              )}
              <p className="text-center text-xs text-muted-foreground">
                Tu acceso se habilita después de confirmar el pago.
              </p>
            </TabsContent>
            <TabsContent value="transfer" className="mt-5 space-y-4">
              {bank && (
                <div className="rounded-xl bg-muted p-4 text-sm">
                  <p className="font-semibold text-navy">{bank.bank}</p>
                  <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
                    <dt className="text-muted-foreground">Tipo</dt>
                    <dd>{bank.accountType}</dd>
                    <dt className="text-muted-foreground">Cuenta</dt>
                    <dd className="font-medium">{bank.accountNumber}</dd>
                    <dt className="text-muted-foreground">Titular</dt>
                    <dd>{bank.holder}</dd>
                    <dt className="text-muted-foreground">RUC</dt>
                    <dd>{bank.holderId}</dd>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="font-semibold text-navy">${amount.toFixed(2)}</dd>
                  </dl>
                </div>
              )}
              <div className="space-y-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
                <div>
                  <p className="font-semibold text-navy">Adjunta tu comprobante de pago</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">
                    Selecciona la foto o el PDF de tu transferencia para solicitar la validación.
                  </p>
                </div>
                <input
                  id={proofInputId}
                  className="sr-only peer"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => setProof(e.target.files?.[0] || null)}
                />
                <Label
                  htmlFor={proofInputId}
                  className="flex min-h-20 cursor-pointer items-center gap-3 rounded-lg border border-gold/50 bg-white px-4 py-3 transition-colors hover:border-gold hover:bg-gold/5 peer-focus-visible:ring-2 peer-focus-visible:ring-gold"
                >
                  {proof ? (
                    <FileText className="h-6 w-6 shrink-0 text-emerald-600" />
                  ) : (
                    <Upload className="h-6 w-6 shrink-0 text-gold" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-semibold text-navy">
                      {proof ? "Comprobante seleccionado" : "Elegir archivo"}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {proof ? proof.name : "Haz clic para buscarlo en tu dispositivo"}
                    </span>
                  </span>
                </Label>
                <p className="text-xs text-muted-foreground">Formatos: PDF, JPG, PNG o WebP.</p>
              </div>
              <Button
                className="w-full"
                variant="gold"
                disabled={loading}
                onClick={() => void sendTransfer()}
              >
                {loading ? <Loader2 className="animate-spin" /> : <Upload />}Enviar comprobante
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Validaremos el pago en un plazo máximo de 24 horas y te notificaremos por correo.
              </p>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
