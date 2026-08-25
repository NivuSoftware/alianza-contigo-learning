import { Mail, MapPin, Phone, ShieldCheck, Target, Users } from "lucide-react";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Header = ({ title, text }: { title: string; text: string }) => (
  <section className="navy-gradient text-white">
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-2xl text-white/70">{text}</p>
    </div>
  </section>
);
export function AboutPage() {
  return (
    <PublicLayout>
      <Header
        title="Educación que abre oportunidades"
        text="Acompañamos a profesionales adultos con programas prácticos, flexibles y respaldados institucionalmente."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          [
            Target,
            "Propósito",
            "Convertir la educación continua en progreso profesional verificable.",
          ],
          [
            Users,
            "Acompañamiento",
            "Docentes con experiencia y una ruta clara de principio a fin.",
          ],
          [
            ShieldCheck,
            "Confianza",
            "Información transparente y certificaciones con aval visible.",
          ],
        ].map(([Icon, title, text]) => {
          const I = Icon as typeof Target;
          return (
            <article key={String(title)}>
              <I className="h-8 w-8 text-gold" />
              <h2 className="mt-4 font-display text-xl font-semibold text-navy">{String(title)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{String(text)}</p>
            </article>
          );
        })}
      </section>
    </PublicLayout>
  );
}
export function ContactPage() {
  return (
    <PublicLayout>
      <Header
        title="Conversemos sobre tu próximo paso"
        text="Nuestro equipo puede orientarte para elegir el programa que mejor se adapte a tus objetivos."
      />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="space-y-6">
          {[
            [Mail, "admisiones@alianzacontigo.ec"],
            [Phone, "+593 2 000 0000"],
            [MapPin, "Quito, Ecuador"],
          ].map(([I, text]) => {
            const Icon = I as typeof Mail;
            return (
              <div className="flex items-center gap-4" key={String(text)}>
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-accent text-gold">
                  <Icon />
                </span>
                <span className="text-sm text-navy">{String(text)}</span>
              </div>
            );
          })}
        </div>
        <form className="surface-card space-y-4 p-6" onSubmit={(e) => e.preventDefault()}>
          <Input placeholder="Nombre completo" />
          <Input type="email" placeholder="Correo electrónico" />
          <Input placeholder="Teléfono" />
          <Textarea placeholder="¿En qué programa estás interesado?" />
          <Button variant="gold">Enviar consulta</Button>
        </form>
      </section>
    </PublicLayout>
  );
}
