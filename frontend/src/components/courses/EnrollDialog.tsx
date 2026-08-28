import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, CreditCard, Loader2, LockKeyhole, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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
  redirect?: string;
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState<CheckoutResponse | null>(null);
  const [bank, setBank] = useState<BankDetails | null>(null);
  const [proof, setProof] = useState<File | null>(null);
  const [card, setCard] = useState({ cardholder: "", cardNumber: "", expiry: "", cvv: "" });
  useEffect(() => {
    if (open && user?.role === "student")
      api<BankDetails>("/payments/bank-details")
        .then(setBank)
        .catch(() => undefined);
  }, [open, user]);
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
    if (!next) setComplete(null);
  }
  async function payCard() {
    setLoading(true);
    try {
      const result = await api<CheckoutResponse>("/payments/card", {
        method: "POST",
        body: JSON.stringify({ courseSlug, ...card }),
      });
      setComplete(result);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo procesar el pago");
    } finally {
      setLoading(false);
    }
  }
  async function sendTransfer() {
    if (!proof) return toast.error("Carga tu comprobante de pago.");
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
            <h3 className="mt-4 text-xl font-semibold text-navy">Solicitud registrada</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {complete.message}
            </p>
            <p className="mt-3 text-xs font-medium text-navy">Referencia {complete.reference}</p>
            <Button
              className="mt-6"
              variant="gold"
              onClick={() => (complete.redirect ? navigate(complete.redirect) : setOpen(false))}
            >
              {complete.redirect ? "Comenzar a estudiar" : "Entendido"}
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
              <div className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                Modo de prueba: no se realizará ningún cobro real. Una tarjeta válida de prueba
                aprobará la inscripción.
              </div>
              <div className="space-y-2">
                <Label>Nombre en la tarjeta</Label>
                <Input
                  value={card.cardholder}
                  onChange={(e) => setCard({ ...card, cardholder: e.target.value })}
                  placeholder="Como aparece en la tarjeta"
                />
              </div>
              <div className="space-y-2">
                <Label>Número de tarjeta</Label>
                <Input
                  inputMode="numeric"
                  value={card.cardNumber}
                  onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Vencimiento</Label>
                  <Input
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    placeholder="MM/AA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              <Button
                variant="gold"
                className="w-full"
                disabled={loading}
                onClick={() => void payCard()}
              >
                {loading ? <Loader2 className="animate-spin" /> : <LockKeyhole />}Pagar $
                {amount.toFixed(2)}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Pago simulado y acceso inmediato
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
                    <dt className="text-muted-foreground">Identificación</dt>
                    <dd>{bank.holderId}</dd>
                    <dt className="text-muted-foreground">Valor</dt>
                    <dd className="font-semibold text-navy">${amount.toFixed(2)}</dd>
                  </dl>
                </div>
              )}
              <div className="space-y-2">
                <Label>Comprobante de pago</Label>
                <Input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => setProof(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG o WebP.</p>
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
