import { FormEvent, useState } from "react";
import { LoaderCircle, Mail, MapPin, Phone, ShieldCheck, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePublicCourses } from "@/hooks/use-public-courses";
import { api, ApiError } from "@/lib/api";

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
        title="Educación que transforma aprendizaje en oportunidades."
        text="En Alianza Contigo desarrollamos experiencias de educación continua para personas que buscan fortalecer sus competencias, actualizar sus conocimientos y seguir creciendo profesionalmente."
      />
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {[
          [
            Target,
            "Propósito",
            "Convertir la educación continua en progreso profesional verificable. Diseñamos rutas de aprendizaje que permiten comprender, aplicar y demostrar lo aprendido ",
          ],
          [
            Users,
            "Acompañamiento",
            "Una ruta clara de aprendizaje, recursos organizados y docentes que orientan al estudiante durante su proceso formativo.",
          ],
          [
            ShieldCheck,
            "Transparencia",
            "Antes de inscribirte conocerás qué aprenderás, cómo será el proceso formativo, sus requisitos de aprobación y la certificación correspondiente.",
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
  const { courses, loading: coursesLoading, error: coursesError, reload } = usePublicCourses();
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      const result = await api<{ message: string }>("/contact", {
        method: "POST",
        body: JSON.stringify({
          courseSlug: data.get("courseSlug"),
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          message: data.get("message"),
        }),
      });
      form.reset();
      toast.success(result.message);
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "No pudimos enviar tu consulta.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PublicLayout>
      <Header
        title="¿Qué te gustaría aprender o fortalecer?"
        text="Cuéntanos que quieres aprender o fortalecer. Nuestro equipo puede orientarte para identificar el programa que mejor se adapte a tus objetivos."
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
        <form className="surface-card space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="courseSlug" className="mb-2 block text-sm font-medium text-navy">
              Programa de interés
            </label>
            <select
              id="courseSlug"
              name="courseSlug"
              required
              disabled={coursesLoading || Boolean(coursesError)}
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-navy shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="" disabled>
                {coursesLoading ? "Cargando programas…" : "Seleccionar programa"}
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.slug}>
                  {course.name}
                </option>
              ))}
            </select>
            {coursesError && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {coursesError}{" "}
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => void reload()}
                >
                  Reintentar
                </button>
              </p>
            )}
          </div>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-navy">
              Nombre completo
            </label>
            <Input id="name" name="name" autoComplete="name" required maxLength={160} />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-navy">
              Correo electrónico
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium text-navy">
              Teléfono
            </label>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-navy">
              Cuéntanos qué estás buscando
            </label>
            <Textarea
              id="message"
              name="message"
              required
              maxLength={3000}
              rows={5}
              className="resize-y"
            />
          </div>
          <Button
            type="submit"
            variant="gold"
            disabled={sending || coursesLoading || Boolean(coursesError)}
          >
            {sending && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {sending ? "Enviando consulta…" : "Enviar consulta"}
          </Button>
        </form>
      </section>
    </PublicLayout>
  );
}
