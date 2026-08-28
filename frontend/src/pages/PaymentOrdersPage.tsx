import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  ReceiptText,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layouts/AppShell";
import { adminNav } from "@/components/layouts/nav";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";

interface Order {
  id: string;
  reference: string;
  courseName: string;
  studentName: string;
  studentEmail: string;
  paymentMethod: string;
  provider: string;
  currency: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  proofUrl?: string;
  rejectionComment: string;
  createdAt: string;
}
interface PaymentSummary {
  receivedTotal: number;
  pendingTotal: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
  payphone: { configured: boolean; status: "READY" | "PENDING_CONFIGURATION" };
}
const labels = { PENDING: "Pendiente", APPROVED: "Aprobado", REJECTED: "Rechazado" };
export function PaymentOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [filter, setFilter] = useState("PENDING");
  const [rejecting, setRejecting] = useState<Order | null>(null);
  const [approving, setApproving] = useState<Order | null>(null);
  const [proofOrder, setProofOrder] = useState<Order | null>(null);
  const [processingId, setProcessingId] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    return Promise.all([
      api<{ orders: Order[] }>(`/payments/orders${filter ? `?status=${filter}` : ""}`),
      api<PaymentSummary>("/payments/admin/summary"),
    ])
      .then(([ordersResponse, summaryResponse]) => {
        setOrders(ordersResponse.orders);
        setSummary(summaryResponse);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [filter]);
  useEffect(() => {
    void load();
  }, [load]);
  async function review(order: Order, decision: "approve" | "reject") {
    if (processingId) return;
    setProcessingId(order.id);
    try {
      await api(`/payments/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ decision, comment }),
      });
      toast.success(
        decision === "approve" ? "Pago aprobado y acceso habilitado" : "Comprobante rechazado",
      );
      setRejecting(null);
      setApproving(null);
      setComment("");
      await load();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "No se pudo procesar");
    } finally {
      setProcessingId("");
    }
  }
  return (
    <AppShell items={adminNav} role="Administrador">
      <PageHeader
        title="Pagos e ingresos"
        description="Controla los ingresos por cursos, concilia transacciones y valida transferencias."
      />
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="surface-card p-5">
          <CircleDollarSign className="h-5 w-5 text-emerald-700" />
          <p className="mt-4 text-2xl font-semibold text-navy">
            ${(summary?.receivedTotal ?? 0).toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Ingresos confirmados</p>
        </article>
        <article className="surface-card p-5">
          <Clock3 className="h-5 w-5 text-amber-700" />
          <p className="mt-4 text-2xl font-semibold text-navy">
            ${(summary?.pendingTotal ?? 0).toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Por validar · {summary?.pendingCount ?? 0} pago(s)
          </p>
        </article>
        <article className="surface-card p-5">
          <ReceiptText className="h-5 w-5 text-gold" />
          <p className="mt-4 text-2xl font-semibold text-navy">{summary?.approvedCount ?? 0}</p>
          <p className="mt-1 text-sm text-muted-foreground">Compras aprobadas</p>
        </article>
      </section>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl bg-navy px-5 py-4 text-white">
        <CreditCard className="h-5 w-5 text-gold" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Integración PayPhone</p>
          <p className="mt-0.5 text-xs text-white/65">
            {summary?.payphone.configured
              ? "Credenciales configuradas; la conciliación está lista para conectarse al checkout."
              : "Pendiente de credenciales. La estructura de transacciones y conciliación ya está preparada."}
          </p>
        </div>
        <Badge
          className={
            summary?.payphone.configured
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-900"
          }
        >
          {summary?.payphone.configured ? "Preparado" : "Pendiente"}
        </Badge>
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ["PENDING", "Pendientes"],
          ["APPROVED", "Aprobados"],
          ["REJECTED", "Rechazados"],
          ["", "Todos"],
        ].map(([value, label]) => (
          <Button
            key={label}
            size="sm"
            variant={filter === value ? "navy" : "outline"}
            onClick={() => setFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="surface-card overflow-x-auto">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Cargando pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div>
              <ReceiptText className="mx-auto h-9 w-9 text-gold" />
              <h2 className="mt-4 font-semibold text-navy">No hay pagos en este estado</h2>
            </div>
          </div>
        ) : (
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-muted/70 text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-4">Estudiante</th>
                <th className="p-4">Curso</th>
                <th className="p-4">Pago</th>
                <th className="p-4">Comprobante</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="p-4">
                    <p className="font-medium text-navy">{order.studentName}</p>
                    <p className="text-xs text-muted-foreground">{order.studentEmail}</p>
                  </td>
                  <td className="p-4">
                    <p>{order.courseName}</p>
                    <p className="text-xs text-muted-foreground">{order.reference}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold">${order.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.paymentMethod === "TRANSFER"
                        ? "Transferencia"
                        : order.paymentMethod === "PAYPHONE"
                          ? "PayPhone"
                          : "Tarjeta simulada"}
                    </p>
                  </td>
                  <td className="p-4">
                    {order.proofUrl ? (
                      <Button size="sm" variant="outline" onClick={() => setProofOrder(order)}>
                        <Eye /> Ver archivo
                      </Button>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        order.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-800"
                          : order.status === "REJECTED"
                            ? "bg-red-50 text-red-800"
                            : "bg-amber-50 text-amber-800"
                      }
                    >
                      {labels[order.status]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      {order.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            disabled={Boolean(processingId)}
                            onClick={() => setApproving(order)}
                          >
                            {processingId === order.id ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <CheckCircle2 />
                            )}
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={Boolean(processingId)}
                            onClick={() => setRejecting(order)}
                          >
                            <XCircle />
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Dialog open={Boolean(proofOrder)} onOpenChange={(open) => !open && setProofOrder(null)}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle>Comprobante · {proofOrder?.reference}</DialogTitle>
            <DialogDescription>
              {proofOrder?.studentName} · {proofOrder?.courseName}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-auto bg-muted p-4 sm:p-6">
            {proofOrder?.proofUrl?.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={proofOrder.proofUrl}
                title={`Comprobante ${proofOrder.reference}`}
                className="h-[68vh] w-full rounded-lg bg-white"
              />
            ) : proofOrder?.proofUrl ? (
              <img
                src={proofOrder.proofUrl}
                alt={`Comprobante de ${proofOrder.studentName}`}
                className="mx-auto max-h-[68vh] max-w-full rounded-lg object-contain"
              />
            ) : (
              <div className="grid min-h-64 place-items-center text-center text-muted-foreground">
                <div>
                  <FileText className="mx-auto h-9 w-9" />
                  <p className="mt-2 text-sm">Archivo no disponible</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(approving)} onOpenChange={(open) => !open && setApproving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Aprobar este pago?</DialogTitle>
            <DialogDescription>
              Se habilitará el acceso de {approving?.studentName} al curso {approving?.courseName} y
              se enviará la confirmación por correo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={Boolean(processingId)}
              onClick={() => setApproving(null)}
            >
              Cancelar
            </Button>
            <Button
              disabled={!approving || Boolean(processingId)}
              onClick={() => approving && void review(approving, "approve")}
            >
              {processingId ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
              Aprobar y habilitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(rejecting)} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar comprobante</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Motivo que recibirá el estudiante</Label>
              <Textarea
                rows={5}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ej. El comprobante no es legible o el valor no coincide."
              />
            </div>
            <Button
              variant="destructive"
              className="w-full"
              disabled={Boolean(processingId)}
              onClick={() => rejecting && void review(rejecting, "reject")}
            >
              {processingId ? <Loader2 className="animate-spin" /> : <XCircle />}
              Confirmar rechazo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
