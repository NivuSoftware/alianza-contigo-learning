/**
 * Patrón Strategy para medios de pago.
 * Prototipo: ninguna pasarela real está conectada. Cada estrategia se puede
 * sustituir por una implementación real sin tocar la interfaz.
 */
export interface PaymentContext {
  courseSlug: string;
  courseName: string;
  studentName: string;
  amount?: number;
}

export interface PaymentResult {
  ok: boolean;
  reference: string;
  message: string;
}

export interface PaymentStrategy {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  pay(context: PaymentContext): Promise<PaymentResult>;
}

const reference = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export class CardPayment implements PaymentStrategy {
  readonly id = "card";
  readonly label = "Tarjeta de crédito / débito";
  readonly description = "Pago en línea inmediato (pendiente de integrar pasarela).";
  async pay(): Promise<PaymentResult> {
    return {
      ok: true,
      reference: reference("CARD"),
      message: "Simulación: pago con tarjeta registrado.",
    };
  }
}

export class TransferPayment implements PaymentStrategy {
  readonly id = "transfer";
  readonly label = "Transferencia bancaria";
  readonly description = "Envía tu comprobante y validamos tu inscripción.";
  async pay(): Promise<PaymentResult> {
    return {
      ok: true,
      reference: reference("TRF"),
      message: "Simulación: transferencia registrada, pendiente de validación.",
    };
  }
}

export class ManualEnrollment implements PaymentStrategy {
  readonly id = "manual";
  readonly label = "Matrícula asistida";
  readonly description = "Un asesor académico se comunicará contigo.";
  async pay(): Promise<PaymentResult> {
    return {
      ok: true,
      reference: reference("MAN"),
      message: "Simulación: solicitud enviada a un asesor académico.",
    };
  }
}

export const paymentStrategies: PaymentStrategy[] = [
  new CardPayment(),
  new TransferPayment(),
  new ManualEnrollment(),
];

export const checkout = (strategy: PaymentStrategy, context: PaymentContext) =>
  strategy.pay(context);
