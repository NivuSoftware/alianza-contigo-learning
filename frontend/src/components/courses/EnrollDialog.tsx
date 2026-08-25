import { useState } from "react";
import { CreditCard, Landmark, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { checkout, paymentStrategies } from "@/services/payment/PaymentStrategy";
import type { ReactNode } from "react";

const icons = [CreditCard, Landmark, UserCheck];

export function EnrollDialog({
  courseSlug,
  courseName,
  trigger,
}: {
  courseSlug: string;
  courseName: string;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(paymentStrategies[0]!.id);
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    const strategy = paymentStrategies.find((s) => s.id === selected)!;
    setLoading(true);
    const result = await checkout(strategy, {
      courseSlug,
      courseName,
      studentName: "Andrea Pérez",
    });
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast.success("Solicitud de inscripción registrada", {
        description: `${result.message} Ref. ${result.reference}`,
      });
    }, 900);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-navy">
            Selecciona tu modalidad de inscripción
          </DialogTitle>
          <DialogDescription>
            {courseName} · prototipo de demostración, ninguna pasarela de pago está conectada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5">
          {paymentStrategies.map((s, i) => {
            const Icon = icons[i] ?? CreditCard;
            const active = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all",
                  active
                    ? "border-gold bg-accent shadow-[var(--shadow-soft)]"
                    : "border-border hover:border-gold/40 hover:bg-accent/40",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-lg",
                    active ? "bg-gold text-white" : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-navy">{s.label}</span>
                  <span className="block text-xs text-muted-foreground">{s.description}</span>
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="gold" onClick={confirm} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Confirmar inscripción
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
